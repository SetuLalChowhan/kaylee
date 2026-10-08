import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { logActivity } from "../utils/activity.util.js";
import { createNotification } from "../utils/notification.util.js";
/**
 * POST /api/invoice — Create a new invoice
 */
export const createInvoice = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const { invoiceNo, campaign, issueDate, dueDate, amount, status, targetUserId } = req.body;
    const invoiceOwnerId = (role === "admin" && targetUserId) ? targetUserId : userId;
    // Find dynamic campaign by title/id to link campaignId, or create it if it doesn't exist
    let dbCampaignId = null;
    const matchingUgc = campaign ? await prisma.ugcCampaign.findFirst({
        where: {
            userId: invoiceOwnerId,
            name: campaign,
        },
    }) : null;
    if (matchingUgc) {
        let dbCampaign = await prisma.campaign.findUnique({
            where: { id: matchingUgc.id },
        });
        if (!dbCampaign) {
            dbCampaign = await prisma.campaign.create({
                data: {
                    id: matchingUgc.id,
                    title: `${campaign}__${matchingUgc.id}`,
                    description: `UgcCampaign:${matchingUgc.id}`,
                },
            });
        }
        dbCampaignId = dbCampaign.id;
    }
    else if (campaign) {
        let dbCampaign = await prisma.campaign.findUnique({
            where: { title: campaign },
        });
        if (!dbCampaign) {
            dbCampaign = await prisma.campaign.create({
                data: {
                    title: `${campaign}__${Date.now()}`,
                    description: `Auto-created via invoice ${invoiceNo}`,
                },
            });
        }
        dbCampaignId = dbCampaign.id;
    }
    const invoice = await prisma.invoice.create({
        data: {
            userId: invoiceOwnerId,
            invoiceNo,
            campaignId: dbCampaignId,
            campaignName: campaign,
            issueDate: issueDate ? new Date(issueDate) : new Date(),
            dueDate: new Date(dueDate),
            amount,
            status: status || "Pending",
        },
    });
    logActivity({
        userId: invoice.userId,
        title: `Invoice #${invoiceNo} created`,
        sub: campaign ? `${campaign} ($${amount})` : `$${amount}`,
        avatarBg: "bg-blue-100",
        avatarText: "INV",
        dotColor: "bg-blue-500",
        type: "INVOICE",
    });
    createNotification({
        userId: invoice.userId,
        title: `Invoice #${invoiceNo} created`,
        description: `Invoice for ${campaign || 'client'} ($${amount}) has been generated.`,
        type: "PAYMENT",
        preferenceKey: "notifyInvoiceUpdates",
    });
    // Sync UgcCampaign amount and payment status with invoice (exact content ID first, fallback to user + name)
    const targetUgcCampaign = matchingUgc || (campaign ? await prisma.ugcCampaign.findFirst({
        where: {
            name: campaign,
            userId: invoice.userId,
        },
    }) : null);
    if (targetUgcCampaign) {
        await prisma.ugcCampaign.update({
            where: { id: targetUgcCampaign.id },
            data: {
                amount,
                paymentStatus: invoice.status === "Paid" ? "Paid" : (invoice.status === "Overdue" ? "Overdue" : "Pending"),
            },
        });
    }
    res.status(201).json({
        status: "success",
        message: "Invoice created successfully",
        data: invoice,
    });
});
/**
 * GET /api/invoice — Retrieve user's invoices with optional status filtering
 */
export const getInvoices = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const isAdmin = role === "admin";
    const { status, includeStats, page, limit, search } = req.query;
    const where = {
        ...(isAdmin ? {} : { userId }),
        ...(status && status !== "All" && (status === "Outstanding"
            ? { status: { in: ["Pending", "Overdue"] } }
            : { status })),
        ...(search && search.trim() !== "" ? {
            OR: [
                { invoiceNo: { contains: search.trim(), mode: "insensitive" } },
                { campaignName: { contains: search.trim(), mode: "insensitive" } },
            ]
        } : {}),
    };
    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit || "10", 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    const [totalCount, invoices] = await Promise.all([
        prisma.invoice.count({ where }),
        prisma.invoice.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNum,
        }),
    ]);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    // Always compute stats across user's all invoices
    const allInvoices = await prisma.invoice.findMany({
        where: isAdmin ? {} : { userId },
        select: { amount: true, status: true, issueDate: true },
    });
    let totalAmount = 0;
    const statsTotalCount = allInvoices.length;
    let paidAmount = 0;
    let paidCount = 0;
    let pendingAmount = 0;
    let pendingCount = 0;
    let overdueAmount = 0;
    let overdueCount = 0;
    let outstandingAmount = 0;
    let outstandingCount = 0;
    let earnedPast30Days = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    for (const inv of allInvoices) {
        const amt = parseFloat(inv.amount.replace(/[^0-9.]/g, "")) || 0;
        totalAmount += amt;
        if (inv.status === "Paid") {
            paidCount++;
            paidAmount += amt;
            if (new Date(inv.issueDate) >= thirtyDaysAgo) {
                earnedPast30Days += amt;
            }
        }
        else if (inv.status === "Pending") {
            pendingCount++;
            pendingAmount += amt;
            outstandingCount++;
            outstandingAmount += amt;
        }
        else if (inv.status === "Overdue") {
            overdueCount++;
            overdueAmount += amt;
            outstandingCount++;
            outstandingAmount += amt;
        }
    }
    res.status(200).json({
        status: "success",
        data: {
            invoices,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages,
            },
            stats: {
                totalCount: statsTotalCount,
                totalAmount,
                paidCount,
                paidAmount,
                pendingCount,
                pendingAmount,
                overdueCount,
                overdueAmount,
                outstandingCount,
                outstandingAmount,
                earnedPast30Days,
            },
        },
    });
});
/**
 * PATCH /api/invoice/:id — Update an existing invoice
 */
export const updateInvoice = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const isAdmin = role === "admin";
    const { id } = req.params;
    const { invoiceNo, campaign, issueDate, dueDate, amount, status } = req.body;
    const existingInvoice = await prisma.invoice.findFirst({
        where: isAdmin ? { id } : { id, userId },
    });
    if (!existingInvoice) {
        return next(new AppError("Invoice not found or unauthorized", 404));
    }
    let campaignId = existingInvoice.campaignId;
    let campaignName = existingInvoice.campaignName;
    if (campaign !== undefined) {
        campaignName = campaign;
        let dbCampaign = campaign ? await prisma.campaign.findUnique({
            where: { title: campaign },
        }) : null;
        if (!dbCampaign && campaign) {
            dbCampaign = await prisma.campaign.create({
                data: {
                    title: campaign,
                    description: `Auto-created via invoice update ${invoiceNo || existingInvoice.invoiceNo}`,
                },
            });
        }
        campaignId = dbCampaign?.id || null;
    }
    const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
            ...(invoiceNo !== undefined && { invoiceNo }),
            campaignId,
            campaignName,
            ...(issueDate !== undefined && { issueDate: issueDate ? new Date(issueDate) : new Date() }),
            ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
            ...(amount !== undefined && { amount }),
            ...(status !== undefined && { status }),
        },
    });
    // Sync UgcCampaign amount and payment status with invoice (by exact campaignId first, fallback to name + userId)
    const finalAmount = amount !== undefined ? amount : existingInvoice.amount;
    const finalCampaignName = campaign !== undefined ? campaign : existingInvoice.campaignName;
    const finalStatus = status !== undefined ? status : updatedInvoice.status;
    const targetUgc = updatedInvoice.campaignId
        ? await prisma.ugcCampaign.findFirst({
            where: { id: updatedInvoice.campaignId, userId: existingInvoice.userId },
        })
        : (finalCampaignName
            ? await prisma.ugcCampaign.findFirst({
                where: { name: finalCampaignName, userId: existingInvoice.userId },
            })
            : null);
    if (targetUgc) {
        await prisma.ugcCampaign.update({
            where: { id: targetUgc.id },
            data: {
                amount: finalAmount,
                paymentStatus: finalStatus === "Paid" ? "Paid" : (finalStatus === "Overdue" ? "Overdue" : "Pending"),
            },
        });
    }
    res.status(200).json({
        status: "success",
        message: "Invoice updated successfully",
        data: updatedInvoice,
    });
    // Log activity for invoice status change or update
    if (status !== undefined && status !== existingInvoice.status) {
        const isPayment = status === "Paid";
        logActivity({
            userId,
            title: isPayment
                ? `Invoice ${updatedInvoice.invoiceNo} marked Paid`
                : `Invoice ${updatedInvoice.invoiceNo} → ${status}`,
            sub: updatedInvoice.campaignName || updatedInvoice.invoiceNo,
            avatarBg: isPayment ? "bg-emerald-100" : "bg-orange-100",
            avatarText: "INV",
            dotColor: isPayment ? "bg-emerald-500" : "bg-orange-500",
            type: "PAYMENT",
        });
        createNotification({
            userId: existingInvoice.userId,
            title: isPayment
                ? `Payment Received - Invoice #${updatedInvoice.invoiceNo}`
                : `Invoice #${updatedInvoice.invoiceNo} is now ${status}`,
            description: `Invoice for ${updatedInvoice.campaignName || 'client'} ($${finalAmount}) was marked as ${status}.`,
            type: "PAYMENT",
            preferenceKey: "notifyInvoiceUpdates",
        });
    }
    else if (amount !== undefined || campaign !== undefined) {
        logActivity({
            userId,
            title: `Invoice ${updatedInvoice.invoiceNo} updated`,
            sub: updatedInvoice.campaignName || updatedInvoice.invoiceNo,
            avatarBg: "bg-blue-100",
            avatarText: "INV",
            dotColor: "bg-blue-500",
            type: "PAYMENT",
        });
    }
});
/**
 * DELETE /api/invoice/:id — Delete an invoice
 */
export const deleteInvoice = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const isAdmin = role === "admin";
    const { id } = req.params;
    const existingInvoice = await prisma.invoice.findFirst({
        where: isAdmin ? { id } : { id, userId },
    });
    if (!existingInvoice) {
        return next(new AppError("Invoice not found or unauthorized", 404));
    }
    await prisma.invoice.delete({
        where: { id },
    });
    logActivity({
        userId: existingInvoice.userId,
        title: `Invoice ${existingInvoice.invoiceNo} deleted`,
        sub: existingInvoice.campaignName || existingInvoice.invoiceNo,
        avatarBg: "bg-red-100",
        avatarText: "INV",
        dotColor: "bg-red-500",
        type: "PAYMENT",
    });
    res.status(200).json({
        status: "success",
        message: "Invoice deleted successfully",
    });
});
//# sourceMappingURL=invoice.controller.js.map
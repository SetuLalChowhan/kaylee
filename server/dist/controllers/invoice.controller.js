import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
/**
 * POST /api/invoice — Create a new invoice
 */
export const createInvoice = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const { invoiceNo, campaign, issueDate, dueDate, amount, status, targetUserId } = req.body;
    // Find dynamic campaign by title to link campaignId
    const dbCampaign = await prisma.campaign.findUnique({
        where: { title: campaign },
    });
    const invoice = await prisma.invoice.create({
        data: {
            userId: (role === "admin" && targetUserId) ? targetUserId : userId,
            invoiceNo,
            campaignId: dbCampaign?.id || null,
            campaignName: campaign,
            issueDate: new Date(issueDate),
            dueDate: new Date(dueDate),
            amount,
            status: status || "Pending",
        },
    });
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
    const { status } = req.query;
    const where = {
        ...(isAdmin ? {} : { userId }),
        ...(status && status !== "All" && { status }),
    };
    const invoices = await prisma.invoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
    res.status(200).json({
        status: "success",
        data: invoices,
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
        const dbCampaign = await prisma.campaign.findUnique({
            where: { title: campaign },
        });
        campaignId = dbCampaign?.id || null;
    }
    const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
            ...(invoiceNo !== undefined && { invoiceNo }),
            campaignId,
            campaignName,
            ...(issueDate !== undefined && { issueDate: new Date(issueDate) }),
            ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
            ...(amount !== undefined && { amount }),
            ...(status !== undefined && { status }),
        },
    });
    res.status(200).json({
        status: "success",
        message: "Invoice updated successfully",
        data: updatedInvoice,
    });
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
    res.status(200).json({
        status: "success",
        message: "Invoice deleted successfully",
    });
});
//# sourceMappingURL=invoice.controller.js.map
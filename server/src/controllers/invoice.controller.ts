import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { logActivity } from "../utils/activity.util.js";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

/**
 * POST /api/invoice — Create a new invoice
 */
export const createInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const { invoiceNo, campaign, issueDate, dueDate, amount, status, targetUserId } = req.body as {
    invoiceNo: string;
    campaign: string;
    issueDate: string;
    dueDate: string;
    amount: string;
    status?: string;
    targetUserId?: string;
  };

  // Find dynamic campaign by title to link campaignId, or create it if it doesn't exist
  let dbCampaign = campaign ? await prisma.campaign.findUnique({
    where: { title: campaign },
  }) : null;

  if (!dbCampaign && campaign) {
    dbCampaign = await prisma.campaign.create({
      data: {
        title: campaign,
        description: `Auto-created via invoice ${invoiceNo}`,
      },
    });
  }

  const invoice = await prisma.invoice.create({
    data: {
      userId: (role === "admin" && targetUserId) ? targetUserId : userId,
      invoiceNo,
      campaignId: dbCampaign?.id || null,
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

  // Sync UgcCampaign amount and payment status with invoice
  if (campaign) {
    const ugcCampaign = await prisma.ugcCampaign.findFirst({
      where: {
        name: campaign,
        userId: invoice.userId,
      },
    });
    if (ugcCampaign) {
      await prisma.ugcCampaign.update({
        where: { id: ugcCampaign.id },
        data: {
          amount,
          paymentStatus: invoice.status === "Paid" ? "Paid" : (invoice.status === "Overdue" ? "Overdue" : "Pending"),
        },
      });
    }
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
export const getInvoices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  const { status, includeStats } = req.query as { status?: string; includeStats?: string };
 
  const where: any = {
    ...(isAdmin ? {} : { userId }),
    ...(status && status !== "All" && (
      status === "Outstanding"
        ? { status: { in: ["Pending", "Overdue"] } }
        : { status }
    )),
  };

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (includeStats === "true") {
    // Get all invoices to compute stats
    const allInvoices = await prisma.invoice.findMany({
      where: isAdmin ? {} : { userId },
    });

    let totalAmount = 0;
    const totalCount = allInvoices.length;
    let paidAmount = 0;
    let paidCount = 0;
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
      } else if (inv.status === "Pending" || inv.status === "Overdue") {
        outstandingCount++;
        outstandingAmount += amt;
      }
    }

    return res.status(200).json({
      status: "success",
      data: {
        invoices,
        stats: {
          totalCount,
          totalAmount,
          paidCount,
          paidAmount,
          outstandingCount,
          outstandingAmount,
          earnedPast30Days,
        }
      },
    });
  }

  res.status(200).json({
    status: "success",
    data: invoices,
  });
});

/**
 * PATCH /api/invoice/:id — Update an existing invoice
 */
export const updateInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  const { id } = req.params as { id: string };
  const { invoiceNo, campaign, issueDate, dueDate, amount, status } = req.body as {
    invoiceNo?: string;
    campaign?: string;
    issueDate?: string;
    dueDate?: string;
    amount?: string;
    status?: string;
  };
 
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

  // Sync UgcCampaign amount and payment status with invoice
  const finalAmount = amount !== undefined ? amount : existingInvoice.amount;
  const finalCampaignName = campaign !== undefined ? campaign : existingInvoice.campaignName;
  const finalStatus = status !== undefined ? status : updatedInvoice.status;
  if (finalCampaignName) {
    const ugcCampaign = await prisma.ugcCampaign.findFirst({
      where: {
        name: finalCampaignName,
        userId: existingInvoice.userId,
      },
    });
    if (ugcCampaign) {
      await prisma.ugcCampaign.update({
        where: { id: ugcCampaign.id },
        data: {
          amount: finalAmount,
          paymentStatus: finalStatus === "Paid" ? "Paid" : (finalStatus === "Overdue" ? "Overdue" : "Pending"),
        },
      });
    }
  }

  res.status(200).json({
    status: "success",
    message: "Invoice updated successfully",
    data: updatedInvoice,
  });
});

/**
 * DELETE /api/invoice/:id — Delete an invoice
 */
export const deleteInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  const { id } = req.params as { id: string };
 
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

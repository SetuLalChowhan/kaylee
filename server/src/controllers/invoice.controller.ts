import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

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
export const getInvoices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  const { status } = req.query as { status?: string };
 
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

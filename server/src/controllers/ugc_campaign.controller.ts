import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import {
  normalizeUploadPath,
  getAbsoluteUploadPath,
} from "../utils/upload.util.js";
import { logActivity } from "../utils/activity.util.js";
import { generateSecureToken, generateSecureOTP, hashToken } from "../utils/otp.util.js";
import { logApprovalAudit } from "../utils/audit.util.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { sendEmail } from "../services/email.service.js";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

function appendPreviewToken(campaign: any) {
  if (!campaign) return campaign;

  const previewToken = jwt.sign(
    { campaignId: campaign.id, type: "preview" },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "30d" }
  );

  const updated = { ...campaign };

  if (updated.media) {
    updated.media = updated.media.map((m: any) => ({
      ...m,
      url: `${m.url}?token=${previewToken}`
    }));
  }

  if (updated.documents) {
    updated.documents = updated.documents.map((d: any) => ({
      ...d,
      url: `${d.url}?token=${previewToken}`
    }));
  }

  if (updated.feedback) {
    updated.feedback = updated.feedback.map((f: any) => {
      const updatedFeedback = { ...f };
      if (f.fileUrl) {
        updatedFeedback.fileUrl = `${f.fileUrl}?token=${previewToken}`;
      }
      if (f.media) {
        updatedFeedback.media = {
          ...f.media,
          url: `${f.media.url}?token=${previewToken}`
        };
      }
      return updatedFeedback;
    });
  }

  return updated;
}

async function checkCampaignAccess(campaignId: string, req: Request) {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  return prisma.ugcCampaign.findFirst({
    where: isAdmin ? { id: campaignId } : { id: campaignId, userId },
  });
}

/**
 * GET /api/ugc-campaigns — Retrieve creator's campaigns
 */
export const getUgcCampaigns = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, role } = (req as AuthRequest).user;
    const isAdmin = role === "admin";
    const { status } = req.query as { status?: string };

    const where: any = isAdmin ? {} : { userId };
    if (status && status !== "all") {
      let formattedStatus = status;
      if (status === "draft") formattedStatus = "Draft";
      if (status === "under-review") formattedStatus = "Under Review";
      if (status === "approved") formattedStatus = "Approved";
      if (status === "completed") formattedStatus = "Completed";
      where.status = formattedStatus;
    }

    const campaigns = await prisma.ugcCampaign.findMany({
      where,
      include: {
        deliverables: { orderBy: { createdAt: "asc" } },
        tasks: { orderBy: { createdAt: "asc" } },
        media: { select: { id: true, name: true, type: true, status: true } },
        feedback: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: campaigns,
    });
  },
);

/**
 * GET /api/ugc-campaigns/:id — Retrieve full campaign details
 */
export const getUgcCampaignById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, role } = (req as AuthRequest).user;
    const isAdmin = role === "admin";
    const { id } = req.params as { id: string };

    const campaign = await prisma.ugcCampaign.findFirst({
      where: isAdmin ? { id } : { id, userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            slug: true,
          },
        },
        deliverables: { orderBy: { createdAt: "asc" } },
        tasks: { orderBy: { createdAt: "asc" } },
        media: { orderBy: { createdAt: "asc" } },
        documents: { orderBy: { createdAt: "asc" } },
        notesComments: { orderBy: { createdAt: "desc" } },
        feedback: {
          orderBy: { createdAt: "asc" },
          include: { media: true },
        },
        auditRecords: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!campaign) {
      return next(new AppError("Campaign not found or unauthorized", 404));
    }

    res.status(200).json({
      status: "success",
      data: appendPreviewToken(campaign),
    });
  },
);

/**
 * POST /api/ugc-campaigns — Create a new campaign
 */
export const createUgcCampaign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, role } = (req as AuthRequest).user;
    const {
      campaignName,
      brandName,
      deadline,
      amount,
      status,
      notes,
      targetUserId,
    } = req.body as {
      campaignName: string;
      brandName: string;
      deadline: string;
      amount: string;
      status?: string;
      notes?: string;
      targetUserId?: string;
    };

    const campaignOwnerId =
      role === "admin" && targetUserId ? targetUserId : userId;

    const baseSlug = `${brandName}-${campaignName}`
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomSuffix}`;
    const campaign = await prisma.$transaction(async (tx) => {
      const c = await tx.ugcCampaign.create({
        data: {
          userId: campaignOwnerId,
          name: campaignName,
          brandName,
          deadline,
          amount,
          status: status || "Pending",
          notes: notes ?? null,
          slug,
          shareToken: generateSecureToken(32),
        },
      });

      // Automatically create a planner task for the campaign deadline
      const plannerTask = await tx.task.create({
        data: {
          userId: campaignOwnerId,
          name: "Campaign Due Date",
          campaign: campaignName,
          date: deadline,
          completed: false,
        },
      });

      // Automatically create the ugc campaign task pointing to the planner task
      await tx.ugcCampaignTask.create({
        data: {
          campaignId: c.id,
          name: "Campaign Due Date",
          date: deadline,
          completed: false,
          plannerTaskId: plannerTask.id,
        },
      });

      // Automatically generate invoice for this campaign
      let validDueDate: Date;
      if (deadline) {
        validDueDate = new Date(deadline);
        if (isNaN(validDueDate.getTime())) {
          validDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
      } else {
        validDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }

      let oldCamp = await tx.campaign.findUnique({ where: { id: c.id } });
      if (!oldCamp) {
        oldCamp = await tx.campaign.create({
          data: {
            id: c.id,
            title: `${campaignName}__${c.id}`,
            description: `UgcCampaign:${c.id} user:${campaignOwnerId}`,
          },
        });
      }

      const randomInvNum = `INV-${Date.now().toString().slice(-6)}`;

      await tx.invoice.create({
        data: {
          userId: campaignOwnerId,
          invoiceNo: randomInvNum,
          campaignId: c.id,
          campaignName: campaignName,
          issueDate: new Date(),
          dueDate: validDueDate,
          amount: amount || "0",
          status: "Pending",
        },
      });

      return c;
    });

    logActivity({
      userId: campaignOwnerId,
      title: `Invoice auto-generated for ${campaignName}`,
      sub: `${brandName} ($${amount || "0"})`,
      avatarBg: "bg-blue-100",
      avatarText: "INV",
      dotColor: "bg-blue-500",
      type: "INVOICE",
      campaignId: campaign.id,
    });

    logActivity({
      userId: campaignOwnerId,
      title: `${brandName} campaign created`,
      sub: campaignName,
      avatarBg: "bg-[#F4EBE1]",
      avatarText: brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-[#005BD6]",
      type: "CAMPAIGN",
      campaignId: campaign.id,
    });

    res.status(201).json({
      status: "success",
      message: "Campaign created successfully",
      data: campaign,
    });
  },
);

export const updateUgcCampaign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, role } = (req as AuthRequest).user;
    const isAdmin = role === "admin";
    const { id } = req.params as { id: string };
    const {
      campaignName,
      brandName,
      deadline,
      amount,
      status,
      releaseFiles,
      notes,
      paymentStatus,
    } = req.body as {
      campaignName?: string;
      brandName?: string;
      deadline?: string;
      amount?: string;
      status?: string;
      releaseFiles?: boolean;
      notes?: string;
      paymentStatus?: string;
      shareEnabled?: boolean;
      regenerateShareToken?: boolean;
      rating?: number;
      ratingNote?: string;
    };

    const existing = await prisma.ugcCampaign.findFirst({
      where: isAdmin ? { id } : { id, userId },
    });
    if (!existing) {
      return next(new AppError("Campaign not found or unauthorized", 404));
    }
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.ugcCampaign.update({
        where: { id },
        data: {
          ...(campaignName !== undefined && { name: campaignName }),
          ...(brandName !== undefined && { brandName }),
          ...(deadline !== undefined && { deadline }),
          ...(amount !== undefined && { amount }),
          ...(status !== undefined && { status }),
          ...(releaseFiles !== undefined && { releaseFiles }),
          ...(notes !== undefined && { notes: notes ?? null }),
          ...(paymentStatus !== undefined && { paymentStatus }),
          ...(req.body.shareEnabled !== undefined && { shareEnabled: req.body.shareEnabled }),
          ...(req.body.regenerateShareToken && { shareToken: generateSecureToken(32) }),
          ...(req.body.rating !== undefined && { rating: req.body.rating }),
          ...(req.body.ratingNote !== undefined && { ratingNote: req.body.ratingNote }),
        },
      });

      // Sync the "Campaign Due Date" task if deadline or name changed
      if (deadline !== undefined || campaignName !== undefined) {
        const campaignDueDateTask = await tx.ugcCampaignTask.findFirst({
          where: {
            campaignId: id,
            name: "Campaign Due Date",
          },
        });

        if (campaignDueDateTask) {
          // Update the campaign task date
          await tx.ugcCampaignTask.update({
            where: { id: campaignDueDateTask.id },
            data: {
              ...(deadline !== undefined && { date: deadline }),
            },
          });

          // Update the planner task date & campaign name
          if (campaignDueDateTask.plannerTaskId) {
            await tx.task.update({
              where: { id: campaignDueDateTask.plannerTaskId },
              data: {
                ...(deadline !== undefined && { date: deadline }),
                ...(campaignName !== undefined && { campaign: campaignName }),
              },
            });
          }
        }
      }

      // Sync back to invoices
      if (paymentStatus !== undefined || amount !== undefined || campaignName !== undefined) {
        const existingName = existing.name;
        
        // Find invoices linked to this campaign by campaignName and userId
        const linkedInvoices = await tx.invoice.findMany({
          where: {
            campaignName: existingName,
            userId: u.userId,
          },
        });
        
        for (const inv of linkedInvoices) {
          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              ...(paymentStatus !== undefined && { status: paymentStatus === "Paid" ? "Paid" : (paymentStatus === "Overdue" ? "Overdue" : "Pending") }),
              ...(amount !== undefined && { amount }),
              ...(campaignName !== undefined && { campaignName }),
            },
          });
        }
      }

      return u;
    });

    res.status(200).json({
      status: "success",
      message: "Campaign updated successfully",
      data: updated,
    });

    // Log activity based on what changed
    const ownerUserId = updated.userId;
    const brandLabel = updated.brandName.substring(0, 5).toUpperCase();

    if (status !== undefined && status !== existing.status) {
      const statusColors: Record<string, { bg: string; dot: string }> = {
        "Pending":      { bg: "bg-yellow-100", dot: "bg-yellow-500" },
        "Active":       { bg: "bg-blue-100",   dot: "bg-blue-500" },
        "Under Review": { bg: "bg-orange-100", dot: "bg-orange-500" },
        "Approved":     { bg: "bg-green-100",  dot: "bg-green-500" },
        "Completed":    { bg: "bg-emerald-100",dot: "bg-emerald-500" },
        "Draft":        { bg: "bg-gray-100",   dot: "bg-gray-400" },
      };
      const color = statusColors[status] || { bg: "bg-gray-100", dot: "bg-gray-400" };
      logActivity({
        userId: ownerUserId,
        title: `${updated.brandName} status → ${status}`,
        sub: updated.name,
        avatarBg: color.bg,
        avatarText: brandLabel,
        dotColor: color.dot,
        type: "CAMPAIGN",
        campaignId: updated.id,
      });
    } else if (paymentStatus !== undefined && paymentStatus !== existing.paymentStatus) {
      logActivity({
        userId: ownerUserId,
        title: `${updated.brandName} payment → ${paymentStatus}`,
        sub: updated.name,
        avatarBg: "bg-emerald-100",
        avatarText: brandLabel,
        dotColor: "bg-emerald-500",
        type: "PAYMENT",
        campaignId: updated.id,
      });
    } else if (campaignName !== undefined || brandName !== undefined || deadline !== undefined || amount !== undefined) {
      logActivity({
        userId: ownerUserId,
        title: `${updated.brandName} campaign updated`,
        sub: updated.name,
        avatarBg: "bg-[#F4EBE1]",
        avatarText: brandLabel,
        dotColor: "bg-[#005BD6]",
        type: "CAMPAIGN",
        campaignId: updated.id,
      });
    }
  },
);

/**
 * DELETE /api/ugc-campaigns/:id — Delete a campaign
 */
export const deleteUgcCampaign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, role } = (req as AuthRequest).user;
    const isAdmin = role === "admin";
    const { id } = req.params as { id: string };

    const existing = await prisma.ugcCampaign.findFirst({
      where: isAdmin ? { id } : { id, userId },
    });
    if (!existing) {
      return next(new AppError("Campaign not found or unauthorized", 404));
    }

    const mediaItems = await prisma.ugcMedia.findMany({
      where: { campaignId: id },
    });
    for (const item of mediaItems) {
      const absPath = getAbsoluteUploadPath(item.url);
      if (fs.existsSync(absPath)) {
        try {
          fs.unlinkSync(absPath);
        } catch {}
      }
    }

    const docs = await prisma.ugcDocument.findMany({
      where: { campaignId: id },
    });
    for (const doc of docs) {
      const absPath = getAbsoluteUploadPath(doc.url);
      if (fs.existsSync(absPath)) {
        try {
          fs.unlinkSync(absPath);
        } catch {}
      }
    }
    const campaignTasks = await prisma.ugcCampaignTask.findMany({
      where: { campaignId: id },
      select: { plannerTaskId: true },
    });
    const plannerTaskIds = campaignTasks
      .map((t) => t.plannerTaskId)
      .filter((pid): pid is string => !!pid);

    await prisma.$transaction(async (tx) => {
      if (plannerTaskIds.length > 0) {
        await tx.task.deleteMany({
          where: { id: { in: plannerTaskIds } },
        }).catch((err) => {
          console.warn("Failed to clean up associated planner tasks: ", err);
        });
      }

      // Automatically delete only the specific invoice strictly associated with this campaign
      await tx.invoice.deleteMany({
        where: {
          userId: existing.userId,
          campaignId: id,
        },
      }).catch((err) => {
        console.warn("Failed to clean up associated invoices: ", err);
      });

      // Clean up legacy Campaign entry if exists
      await tx.campaign.deleteMany({
        where: { id },
      }).catch(() => {});

      await tx.ugcCampaign.delete({ where: { id } });
    });

    const brandLabel = (existing.brandName || "CAMP").substring(0, 5).toUpperCase();
    logActivity({
      userId: existing.userId,
      title: `${existing.brandName} campaign deleted`,
      sub: existing.name,
      avatarBg: "bg-red-100",
      avatarText: brandLabel,
      dotColor: "bg-red-500",
      type: "CAMPAIGN",
    });

    res.status(200).json({
      status: "success",
      message: "Campaign deleted successfully",
    });
  },
);

/**
 * Deliverables Operations
 */
export const createDeliverable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId } = req.params as { campaignId: string };
    const { text } = req.body as { text: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const deliverable = await prisma.ugcDeliverable.create({
      data: { campaignId, text },
    });

    const brandLabel = (campaign.brandName || "DLVR").substring(0, 5).toUpperCase();
    logActivity({
      userId,
      title: `${campaign.brandName} - Deliverable added`,
      sub: `${campaign.name}: ${text.substring(0, 50)}`,
      avatarBg: "bg-indigo-100",
      avatarText: brandLabel,
      dotColor: "bg-indigo-500",
      type: "DELIVERABLE",
      campaignId,
    });

    res.status(201).json({ status: "success", data: deliverable });
  },
);

export const updateDeliverable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };
    const { text, progress } = req.body as { text?: string; progress?: string[] };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const existingDeliverable = await prisma.ugcDeliverable.findUnique({
      where: { id },
    });
    if (!existingDeliverable) return next(new AppError("Deliverable not found", 404));

    const updated = await prisma.ugcDeliverable.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(progress !== undefined && { progress }),
      },
    });

    res.status(200).json({ status: "success", data: updated });
  },
);

export const deleteDeliverable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    await prisma.ugcDeliverable.delete({ where: { id } });

    res
      .status(200)
      .json({ status: "success", message: "Deliverable deleted successfully" });
  },
);

/**
 * Tasks Operations
 */
export const createCampaignTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId } = req.params as { campaignId: string };
    const { name, date, completed } = req.body as {
      name: string;
      date: string;
      completed?: boolean;
    };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const task = await prisma.$transaction(async (tx) => {
      // 1. Create a task in the planner table
      const plannerTask = await tx.task.create({
        data: {
          userId: campaign.userId,
          name,
          campaign: campaign.name,
          date,
          completed: completed ?? false,
        },
      });

      // 2. Create the campaign task pointing to the planner task
      return tx.ugcCampaignTask.create({
        data: {
          campaignId,
          name,
          date,
          completed: completed ?? false,
          plannerTaskId: plannerTask.id,
        },
      });
    });

    res.status(201).json({ status: "success", data: task });
  },
);

export const updateCampaignTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId, id } = req.params as { campaignId: string; id: string };
    const { name, date, completed } = req.body as {
      name?: string;
      date?: string;
      completed?: boolean;
    };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const existingTask = await prisma.ugcCampaignTask.findUnique({
      where: { id },
    });
    if (!existingTask) return next(new AppError("Task not found", 404));

    const task = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.ugcCampaignTask.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(date !== undefined && { date }),
          ...(completed !== undefined && { completed }),
        },
      });

      // Update corresponding planner task
      if (existingTask.plannerTaskId) {
        await tx.task
          .update({
            where: { id: existingTask.plannerTaskId },
            data: {
              ...(name !== undefined && { name }),
              ...(date !== undefined && { date }),
              ...(completed !== undefined && { completed }),
            },
          })
          .catch((err) => {
            console.warn("Failed to sync planner task update: ", err);
          });
      }

      return updatedTask;
    });

    res.status(200).json({ status: "success", data: task });
  },
);

export const deleteCampaignTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const existingTask = await prisma.ugcCampaignTask.findUnique({
      where: { id },
    });

    await prisma.$transaction(async (tx) => {
      if (existingTask && existingTask.plannerTaskId) {
        await tx.task
          .delete({ where: { id: existingTask.plannerTaskId } })
          .catch((err) => {
            console.warn("Failed to sync planner task deletion: ", err);
          });
      }

      await tx.ugcCampaignTask.delete({ where: { id } });
    });

    res
      .status(200)
      .json({ status: "success", message: "Task deleted successfully" });
  },
);

/**
 * Media Operations
 */
export const uploadMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId } = req.params as { campaignId: string };
    const { title, description, assetType } = req.body as {
      title?: string;
      description?: string;
      assetType?: string;
    };

    if (!req.file) return next(new AppError("Media file is required", 400));

    const ALLOWED_ASSET_TYPES = ["Video", "Raw Footage", "B-Roll", "Photo", "Graphic", "Audio", "Other"];
    if (!assetType || !ALLOWED_ASSET_TYPES.includes(assetType)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Invalid or missing asset type categorization", 400));
    }

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Campaign not found or unauthorized", 404));
    }

    const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
    if (type === "image" && req.file.size > 50 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Image file size must be less than 50MB", 400));
    }
    if (type === "video" && req.file.size > 500 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Video file size must be less than 500MB", 400));
    }

    const url = normalizeUploadPath(req.file.path);

    const media = await prisma.ugcMedia.create({
      data: {
        campaignId,
        name: title || req.file.originalname,
        originalName: req.file.originalname,
        type,
        url,
        description: description ?? null,
        assetType,
        status: "pending",
      },
    });

    await prisma.ugcCampaign.update({
      where: { id: campaignId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ status: "success", data: media });
  },
);

/**
 * PATCH /api/ugc-campaigns/:campaignId/media/:id/replace — Replace a single media item
 */
export const replaceMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId, id } = req.params as { campaignId: string; id: string };
    const { title, description, assetType } = req.body as {
      title?: string;
      description?: string;
      assetType?: string;
    };

    if (!req.file)
      return next(new AppError("Replacement file is required", 400));

    const ALLOWED_ASSET_TYPES = ["Video", "Raw Footage", "B-Roll", "Photo", "Graphic", "Audio", "Other"];
    if (assetType && !ALLOWED_ASSET_TYPES.includes(assetType)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Invalid asset type categorization", 400));
    }

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Campaign not found or unauthorized", 404));
    }

    // Find and delete the old physical file
    const existing = await prisma.ugcMedia.findUnique({ where: { id } });
    if (!existing) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Media item not found", 404));
    }

    const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
    if (type === "image" && req.file.size > 50 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Image file size must be less than 50MB", 400));
    }
    if (type === "video" && req.file.size > 500 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Video file size must be less than 500MB", 400));
    }

    const absolutePath = getAbsoluteUploadPath(existing.url);
    if (existing.url && fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch {}
    }

    const url = normalizeUploadPath(req.file.path);

    // Update the existing record in-place (preserves ID & relations, resets status to pending)
    const updated = await prisma.ugcMedia.update({
      where: { id },
      data: {
        name: title || req.file.originalname,
        originalName: req.file.originalname,
        type,
        url,
        description: description ?? existing.description,
        status: "pending",
        assetType: assetType ?? existing.assetType,
      },
    });

    res.status(200).json({ status: "success", data: updated });
  },
);

export const deleteMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const media = await prisma.ugcMedia.findUnique({ where: { id } });
    if (media) {
      const absolutePath = getAbsoluteUploadPath(media.url);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch {}
      }
    }

    await prisma.ugcMedia.delete({ where: { id } });

    res
      .status(200)
      .json({ status: "success", message: "Media deleted successfully" });
  },
);

/**
 * Documents Operations
 */
export const uploadDocument = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId } = req.params as { campaignId: string };
    const { title } = req.body as { title?: string };

    if (!req.file) return next(new AppError("Document file is required", 400));

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(new AppError("Campaign not found or unauthorized", 404));
    }

    if (req.file.size > 50 * 1024 * 1024) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return next(
        new AppError("Document file size must be less than 50MB", 400),
      );
    }

    const url = normalizeUploadPath(req.file.path);

    const doc = await prisma.ugcDocument.create({
      data: {
        campaignId,
        name: title || req.file.originalname,
        originalName: req.file.originalname,
        url,
      },
    });

    res.status(201).json({ status: "success", data: doc });
  },
);

export const deleteDocument = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const doc = await prisma.ugcDocument.findUnique({ where: { id } });
    if (doc) {
      const absolutePath = getAbsoluteUploadPath(doc.url);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch {}
      }
    }

    await prisma.ugcDocument.delete({ where: { id } });

    res
      .status(200)
      .json({ status: "success", message: "Document deleted successfully" });
  },
);

/**
 * Notes Operations
 */
export const createNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId } = req.params as { campaignId: string };
    const { text } = req.body as { text: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const note = await prisma.ugcNote.create({
      data: { campaignId, text },
    });

    res.status(201).json({ status: "success", data: note });
  },
);

export const deleteNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    await prisma.ugcNote.delete({ where: { id } });

    res
      .status(200)
      .json({ status: "success", message: "Note deleted successfully" });
  },
);

/**
 * Feedback Messages
 */
export const createFeedback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    const { campaignId } = req.params as { campaignId: string };
    const { text, mediaId } = req.body as { text: string; mediaId?: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    let fileUrl = null;
    if (req.file) {
      fileUrl = normalizeUploadPath(req.file.path);
    }

    const message = await prisma.ugcFeedbackMessage.create({
      data: {
        campaignId,
        text,
        from: "creator",
        mediaId: mediaId || null,
        fileUrl,
      },
      include: { media: true },
    });

    res.status(201).json({ status: "success", data: message });
  },
);

/**
 * ── GUEST PUBLIC ENDPOINTS ──────────────────────────────────────────────────
 */

const getBrandSession = async (req: Request, campaignId: string) => {
  const sessionCookie = req.cookies[`campaign_session_${campaignId}`];
  if (!sessionCookie) return null;
  const hashedSession = hashToken(sessionCookie);
  const session = await prisma.ugcBrandSession.findFirst({
    where: {
      campaignId,
      tokenHash: hashedSession,
      expiresAt: { gt: new Date() },
      revokedAt: null,
    },
  });
  return session;
};

export const getPublicCampaignBySlug = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // The route parameter is :slug, but we treat it as shareToken for security
    const { slug } = req.params as { slug: string };

    const campaign = await prisma.ugcCampaign.findUnique({
      where: { shareToken: slug },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true, slug: true, email: true } },
        deliverables: { orderBy: { createdAt: "asc" } },
        tasks: { orderBy: { createdAt: "asc" } },
        media: { orderBy: { createdAt: "asc" } },
        documents: { orderBy: { createdAt: "asc" } },
        notesComments: { orderBy: { createdAt: "desc" } },
        feedback: { orderBy: { createdAt: "asc" }, include: { media: true } },
      },
    });

    if (!campaign) {
      return next(new AppError("Campaign not found", 404));
    }

    if (!campaign.shareEnabled) {
      return next(new AppError("Campaign link is disabled", 403));
    }

    if (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date()) {
      return next(new AppError("Campaign link has expired", 403));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) {
      return res.status(401).json({ status: "auth_required", message: "Authentication required", campaignId: campaign.id, brandName: campaign.brandName });
    }

    if (campaign.status === "Draft" || campaign.status === "Active") {
      await prisma.ugcCampaign.update({
        where: { id: campaign.id },
        data: { status: "Under Review", updatedAt: new Date() },
      });
      campaign.status = "Under Review";
    }

    // Filter response to avoid exposing unnecessary sensitive info
    const safeCampaign = {
      ...campaign,
      userId: undefined,
      tasks: undefined, // internal tasks usually not needed by brand, but if needed keep it
    };

    await logApprovalAudit({ campaignId: campaign.id, action: "PAGE_VIEW", email: session.email, ipAddress: req.ip, sessionId: session.id });
    res.status(200).json({
      status: "success",
      data: appendPreviewToken(safeCampaign),
    });
  },
);

export const requestOtpPublic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };
    const { email } = req.body as { email: string };

    if (!email) return next(new AppError("Email is required", 400));

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Invalid or expired campaign link", 403));
    }

    const otp = generateSecureOTP();
    const hash = hashToken(otp);
    
    // Invalidate previous OTPs for this email and campaign
    await prisma.ugcOtp.updateMany({
      where: { campaignId: campaign.id, email, used: false },
      data: { used: true },
    });

    await prisma.ugcOtp.create({
      data: {
        campaignId: campaign.id,
        email,
        hash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      }
    });

    // Use email service
    const sent = await sendEmail(
      email,
      `Your OTP for ${campaign.name}`,
      `<p>Your verification code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
    );

    if (!sent) {
      // Invalidate the OTP so a failed delivery can't be reported as success.
      await prisma.ugcOtp.updateMany({
        where: { campaignId: campaign.id, email, used: false },
        data: { used: true },
      });
      return next(
        new AppError(
          "Could not send the OTP email. Please try again later.",
          502
        )
      );
    }

    await logApprovalAudit({ campaignId: campaign.id, action: "OTP_REQUESTED", email, ipAddress: req.ip });

    res.status(200).json({ status: "success", message: "OTP sent" });
  }
);

export const verifyOtpPublic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };
    const { email, otp } = req.body as { email: string; otp: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Invalid or expired campaign link", 403));
    }

    const hash = hashToken(otp);
    const otpRecord = await prisma.ugcOtp.findFirst({
      where: { campaignId: campaign.id, email, hash, used: false, expiresAt: { gt: new Date() } }
    });

    if (!otpRecord) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    await prisma.ugcOtp.update({ where: { id: otpRecord.id }, data: { used: true } });

    const sessionToken = generateSecureToken(32);
    const sessionHash = hashToken(sessionToken);

    const session = await prisma.ugcBrandSession.create({
      data: {
        campaignId: campaign.id,
        email,
        tokenHash: sessionHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    await logApprovalAudit({ campaignId: campaign.id, action: "OTP_VERIFIED", email, ipAddress: req.ip });
    await logApprovalAudit({ campaignId: campaign.id, action: "SESSION_CREATED", email, ipAddress: req.ip, sessionId: session.id });

    // Set HttpOnly cookie
    res.cookie(`campaign_session_${campaign.id}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ status: "success", message: "Verified successfully" });
  }
);

export const updatePublicMediaStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug, mediaId } = req.params as { slug: string; mediaId: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign not found or invalid link", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) return next(new AppError("Unauthorized", 401));

    if (mediaId === "all") {
      const pendingMedia = await prisma.ugcMedia.findMany({ where: { campaignId: campaign.id, status: { not: "approved" } } });
      
      await prisma.ugcMedia.updateMany({
        where: { campaignId: campaign.id, status: { not: "approved" } },
        data: { status: "approved" },
      });
      await prisma.ugcCampaign.update({
        where: { id: campaign.id },
        data: { status: "Approved", updatedAt: new Date() },
      });

      logActivity({
        userId: campaign.userId,
        title: `${campaign.brandName} approved all media`,
        sub: campaign.name,
        avatarBg: "bg-green-100",
        avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
        dotColor: "bg-green-500",
        type: "APPROVAL",
        campaignId: campaign.id,
      });
      await logApprovalAudit({ campaignId: campaign.id, action: "APPROVED_ALL", email: session.email, ipAddress: req.ip, sessionId: session.id });

      return res.status(200).json({ status: "success", message: "All media items approved" });
    }

    const media = await prisma.ugcMedia.findFirst({ where: { id: mediaId, campaignId: campaign.id } });
    if (!media) return next(new AppError("Media not found or unauthorized", 404));

    if (media.status === "approved") {
      return next(new AppError("Media is already approved and cannot be changed", 400));
    }

    const updatedMedia = await prisma.ugcMedia.update({
      where: { id: mediaId },
      data: { status: "approved" },
    });

    const remainingUnapproved = await prisma.ugcMedia.count({
      where: { campaignId: campaign.id, status: { not: "approved" } },
    });
    if (remainingUnapproved === 0) {
      await prisma.ugcCampaign.update({
        where: { id: campaign.id },
        data: { status: "Approved", updatedAt: new Date() },
      });
    }

    logActivity({
      userId: campaign.userId,
      title: `${campaign.brandName} approved content`,
      sub: campaign.name,
      avatarBg: "bg-green-100",
      avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-green-500",
      type: "APPROVAL",
      campaignId: campaign.id,
    });
    await logApprovalAudit({ campaignId: campaign.id, mediaId, action: "APPROVED", email: session.email, ipAddress: req.ip, sessionId: session.id });

    res.status(200).json({ status: "success", data: updatedMedia });
  },
);

export const requestChangesPublicMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug, mediaId } = req.params as { slug: string; mediaId: string };
    const { text } = req.body as { text: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign not found or invalid link", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) return next(new AppError("Unauthorized", 401));

    const media = await prisma.ugcMedia.findFirst({ where: { id: mediaId, campaignId: campaign.id } });
    if (!media) return next(new AppError("Media not found or unauthorized", 404));

    if (media.status === "approved") {
      return next(new AppError("Cannot request changes on already approved media", 400));
    }

    await prisma.ugcMedia.update({
      where: { id: mediaId },
      data: { status: "changes_requested" },
    });

    const message = await prisma.ugcFeedbackMessage.create({
      data: {
        campaignId: campaign.id,
        text,
        from: "brand",
        mediaId,
      },
      include: { media: true },
    });

    logActivity({
      userId: campaign.userId,
      title: `${campaign.brandName} requested changes`,
      sub: text.substring(0, 60),
      avatarBg: "bg-orange-100",
      avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-orange-500",
      type: "FEEDBACK",
      campaignId: campaign.id,
    });
    await logApprovalAudit({ campaignId: campaign.id, mediaId, action: "CHANGE_REQUESTED", email: session.email, ipAddress: req.ip, sessionId: session.id });

    res.status(200).json({ status: "success", data: message });
  },
);

export const createPublicFeedback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };
    const { text, mediaId } = req.body as { text: string; mediaId?: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign not found or invalid link", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) return next(new AppError("Unauthorized", 401));
    
    if (mediaId) {
       const media = await prisma.ugcMedia.findFirst({ where: { id: mediaId, campaignId: campaign.id } });
       if (!media) return next(new AppError("Media not found or unauthorized", 404));
    }

    const message = await prisma.ugcFeedbackMessage.create({
      data: {
        campaignId: campaign.id,
        text,
        from: "brand",
        mediaId: mediaId || null,
      },
      include: { media: true },
    });

    logActivity({
      userId: campaign.userId,
      title: `${campaign.brandName} left feedback`,
      sub: text.substring(0, 60),
      avatarBg: "bg-purple-100",
      avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-purple-500",
      type: "FEEDBACK",
      campaignId: campaign.id,
    });

    await logApprovalAudit({ campaignId: campaign.id, mediaId: mediaId || null, action: "FEEDBACK_SUBMITTED", email: session.email, ipAddress: req.ip, sessionId: session.id }); res.status(201).json({ status: "success", data: message });
  },
);

export const rateCampaignPublic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };
    const { rating, ratingNote } = req.body as { rating: number; ratingNote?: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign not found or invalid link", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) return next(new AppError("Unauthorized", 401));

    const updated = await prisma.ugcCampaign.update({
      where: { id: campaign.id },
      data: { rating, ratingNote: ratingNote ?? null },
    });

    logActivity({
      userId: campaign.userId,
      title: `${campaign.brandName} rated the campaign`,
      sub: `${rating} Stars${ratingNote ? ` - ${ratingNote.substring(0, 40)}` : ""}`,
      avatarBg: "bg-yellow-100",
      avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-yellow-500",
      type: "CAMPAIGN",
      campaignId: campaign.id,
    });

    await logApprovalAudit({
      campaignId: campaign.id,
      action: "RATING_SUBMITTED",
      email: session.email,
      ipAddress: req.ip,
      sessionId: session.id
    });
    res.status(200).json({ status: "success", data: updated });
  }
);

export const getAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = (req as AuthRequest).user;
    
    const monthsParam = parseInt(req.query.months as string) || 6;
    const monthsToFetch = isNaN(monthsParam) || monthsParam < 1 ? 6 : monthsParam;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToFetch + 1); // +1 because current month is month 1
    startDate.setDate(1); // Start from the 1st of that month
    startDate.setHours(0, 0, 0, 0);

    const campaigns = await prisma.ugcCampaign.findMany({
      where: { 
        userId,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentStatus: true,
        rating: true,
        name: true,
        brandName: true,
        createdAt: true,
      }
    });

    const paidIncome = campaigns
      .filter((c) => c.paymentStatus === "Paid")
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const completedCampaigns = campaigns.filter((c) => c.status === "Approved" || c.status === "Completed" || c.status === "Delivered").length;

    const ratedCampaigns = campaigns.filter(c => c.rating);
    const avgRating = ratedCampaigns.length ? (ratedCampaigns.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedCampaigns.length).toFixed(1) : 0;

    const graphData = [];
    const earningsOverview = [];
    const deliverablesCompletedGraph = [];
    
    // Generate last N months data
    for (let i = monthsToFetch - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      
      const monthCampaigns = campaigns.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate.getMonth() === d.getMonth() && cDate.getFullYear() === year;
      });

      const income = monthCampaigns
        .filter(c => c.paymentStatus === "Paid")
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

      const completedCount = monthCampaigns.filter(c => c.status === "Approved" || c.status === "Completed" || c.status === "Delivered").length;

      earningsOverview.push({ name: monthStr, totalEarnings: income });
      deliverablesCompletedGraph.push({ name: monthStr, totalDeliverables: completedCount });
    }

    // Campaign Status Breakdown for Donut Chart
    const statusCounts = campaigns.reduce((acc: any, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    
    const colors = ['#0084FF', '#A855F7', '#EC4899', '#EAB308'];
    const campaignStatusData = Object.keys(statusCounts).map((key, i) => ({
      name: key,
      value: statusCounts[key],
      color: colors[i % colors.length]
    }));

    // Top Campaigns
    const maxAmount = campaigns.reduce((max, c) => Math.max(max, parseFloat(c.amount) || 0), 0);
    const topCampaigns = [...campaigns]
      .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))
      .slice(0, 4) // As per design, 4 is usually good
      .map(c => {
        const amountNum = parseFloat(c.amount) || 0;
        return {
          id: c.id,
          name: c.name,
          brandName: c.brandName,
          amount: c.amount,
          status: c.status,
          rating: c.rating,
          percentage: maxAmount > 0 ? (amountNum / maxAmount) * 100 : 0
        };
      });

    res.status(200).json({
      status: "success",
      data: {
        totalIncome: paidIncome,
        completedCampaigns,
        avgRating,
        earningsOverview,
        deliverablesCompletedGraph,
        campaignStatusData,
        topCampaigns,
      }
    });
  }
);

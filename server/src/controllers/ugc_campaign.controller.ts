import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import fs from "fs";
import { normalizeUploadPath, getAbsoluteUploadPath } from "../utils/upload.util.js";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

async function checkCampaignAccess(campaignId: string, req: Request) {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  return prisma.ugcCampaign.findFirst({
    where: isAdmin ? { id: campaignId } : { id: campaignId, userId }
  });
}

/**
 * GET /api/ugc-campaigns — Retrieve creator's campaigns
 */
export const getUgcCampaigns = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    status: "success",
    data: campaigns,
  });
});

/**
 * GET /api/ugc-campaigns/:id — Retrieve full campaign details
 */
export const getUgcCampaignById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  const { id } = req.params as { id: string };

  const campaign = await prisma.ugcCampaign.findFirst({
    where: isAdmin ? { id } : { id, userId },
    include: {
      deliverables: { orderBy: { createdAt: "asc" } },
      tasks: { orderBy: { createdAt: "asc" } },
      media: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "asc" } },
      notesComments: { orderBy: { createdAt: "desc" } },
      feedback: {
        orderBy: { createdAt: "asc" },
        include: { media: true },
      },
    },
  });

  if (!campaign) {
    return next(new AppError("Campaign not found or unauthorized", 404));
  }

  res.status(200).json({
    status: "success",
    data: campaign,
  });
});

/**
 * POST /api/ugc-campaigns — Create a new campaign
 */
export const createUgcCampaign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const { campaignName, brandName, deadline, amount, status, notes, targetUserId } = req.body as {
    campaignName: string;
    brandName: string;
    deadline: string;
    amount: string;
    status?: string;
    notes?: string;
    targetUserId?: string;
  };

  const campaignOwnerId = (role === "admin" && targetUserId) ? targetUserId : userId;

  // Enforce campaign limit based on user subscription
  const existingCount = await prisma.ugcCampaign.count({
    where: { userId: campaignOwnerId }
  });

  const userWithPlan = await prisma.user.findUnique({
    where: { id: campaignOwnerId },
    include: { plan: true }
  });

  const campaignLimit = userWithPlan?.plan?.campaignLimit ?? 2;

  if (existingCount >= campaignLimit) {
    return next(new AppError(`Plan limit reached. This user can only create up to ${campaignLimit} campaigns. Please upgrade the subscription.`, 403));
  }

  const baseSlug = `${brandName}-${campaignName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const slug = `${baseSlug}-${randomSuffix}`;

  const campaign = await prisma.ugcCampaign.create({
    data: {
      userId: campaignOwnerId,
      name: campaignName,
      brandName,
      deadline,
      amount,
      status: status || "Pending",
      notes: notes ?? null,
      slug,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Campaign created successfully",
    data: campaign,
  });
});

export const updateUgcCampaign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  const { id } = req.params as { id: string };
  const { campaignName, brandName, deadline, amount, status, releaseFiles, notes, paymentStatus } = req.body as {
    campaignName?: string;
    brandName?: string;
    deadline?: string;
    amount?: string;
    status?: string;
    releaseFiles?: boolean;
    notes?: string;
    paymentStatus?: string;
  };

  const existing = await prisma.ugcCampaign.findFirst({
    where: isAdmin ? { id } : { id, userId }
  });
  if (!existing) {
    return next(new AppError("Campaign not found or unauthorized", 404));
  }

  const updated = await prisma.ugcCampaign.update({
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
    },
  });

  res.status(200).json({
    status: "success",
    message: "Campaign updated successfully",
    data: updated,
  });
});

/**
 * DELETE /api/ugc-campaigns/:id — Delete a campaign
 */
export const deleteUgcCampaign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";
  const { id } = req.params as { id: string };

  const existing = await prisma.ugcCampaign.findFirst({
    where: isAdmin ? { id } : { id, userId }
  });
  if (!existing) {
    return next(new AppError("Campaign not found or unauthorized", 404));
  }

  const mediaItems = await prisma.ugcMedia.findMany({ where: { campaignId: id } });
  for (const item of mediaItems) {
    const absPath = getAbsoluteUploadPath(item.url);
    if (fs.existsSync(absPath)) {
      try {
        fs.unlinkSync(absPath);
      } catch { }
    }
  }

  const docs = await prisma.ugcDocument.findMany({ where: { campaignId: id } });
  for (const doc of docs) {
    const absPath = getAbsoluteUploadPath(doc.url);
    if (fs.existsSync(absPath)) {
      try {
        fs.unlinkSync(absPath);
      } catch { }
    }
  }

  await prisma.ugcCampaign.delete({ where: { id } });

  res.status(200).json({
    status: "success",
    message: "Campaign deleted successfully",
  });
});

/**
 * Deliverables Operations
 */
export const createDeliverable = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId } = req.params as { campaignId: string };
  const { text } = req.body as { text: string };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

  const deliverable = await prisma.ugcDeliverable.create({
    data: { campaignId, text },
  });

  res.status(201).json({ status: "success", data: deliverable });
});

export const deleteDeliverable = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId, id } = req.params as { campaignId: string; id: string };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

  await prisma.ugcDeliverable.delete({ where: { id } });

  res.status(200).json({ status: "success", message: "Deliverable deleted successfully" });
});

/**
 * Tasks Operations
 */
export const createCampaignTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId } = req.params as { campaignId: string };
  const { name, date, completed } = req.body as { name: string; date: string; completed?: boolean };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

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
});

export const updateCampaignTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId, id } = req.params as { campaignId: string; id: string };
  const { name, date, completed } = req.body as { name?: string; date?: string; completed?: boolean };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

  const existingTask = await prisma.ugcCampaignTask.findUnique({ where: { id } });
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
      await tx.task.update({
        where: { id: existingTask.plannerTaskId },
        data: {
          ...(name !== undefined && { name }),
          ...(date !== undefined && { date }),
          ...(completed !== undefined && { completed }),
        },
      }).catch((err) => {
        console.warn("Failed to sync planner task update: ", err);
      });
    }

    return updatedTask;
  });

  res.status(200).json({ status: "success", data: task });
});

export const deleteCampaignTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId, id } = req.params as { campaignId: string; id: string };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

  const existingTask = await prisma.ugcCampaignTask.findUnique({ where: { id } });
  
  await prisma.$transaction(async (tx) => {
    if (existingTask && existingTask.plannerTaskId) {
      await tx.task.delete({ where: { id: existingTask.plannerTaskId } })
        .catch((err) => {
          console.warn("Failed to sync planner task deletion: ", err);
        });
    }

    await tx.ugcCampaignTask.delete({ where: { id } });
  });

  res.status(200).json({ status: "success", message: "Task deleted successfully" });
});

/**
 * Media Operations
 */
export const uploadMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId } = req.params as { campaignId: string };
  const { title, description } = req.body as { title?: string; description?: string };

  if (!req.file) return next(new AppError("Media file is required", 400));

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError("Campaign not found or unauthorized", 404));
  }

  const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
  if (type === "image" && req.file.size > 20 * 1024 * 1024) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError("Image file size must be less than 20MB", 400));
  }
  if (type === "video" && req.file.size > 100 * 1024 * 1024) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError("Video file size must be less than 100MB", 400));
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
      status: "pending",
    },
  });

  res.status(201).json({ status: "success", data: media });
});

/**
 * PATCH /api/ugc-campaigns/:campaignId/media/:id/replace — Replace a single media item
 */
export const replaceMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId, id } = req.params as { campaignId: string; id: string };
  const { title, description } = req.body as { title?: string; description?: string };

  if (!req.file) return next(new AppError("Replacement file is required", 400));

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
  if (type === "image" && req.file.size > 20 * 1024 * 1024) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError("Image file size must be less than 20MB", 400));
  }
  if (type === "video" && req.file.size > 100 * 1024 * 1024) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError("Video file size must be less than 100MB", 400));
  }

  const absolutePath = getAbsoluteUploadPath(existing.url);
  if (existing.url && fs.existsSync(absolutePath)) {
    try { fs.unlinkSync(absolutePath); } catch { }
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
    },
  });

  res.status(200).json({ status: "success", data: updated });
});



export const deleteMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId, id } = req.params as { campaignId: string; id: string };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

  const media = await prisma.ugcMedia.findUnique({ where: { id } });
  if (media) {
    const absolutePath = getAbsoluteUploadPath(media.url);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch { }
    }
  }

  await prisma.ugcMedia.delete({ where: { id } });

  res.status(200).json({ status: "success", message: "Media deleted successfully" });
});

/**
 * Documents Operations
 */
export const uploadDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId } = req.params as { campaignId: string };
  const { title } = req.body as { title?: string };

  if (!req.file) return next(new AppError("Document file is required", 400));

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError("Campaign not found or unauthorized", 404));
  }

  if (req.file.size > 10 * 1024 * 1024) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError("Document file size must be less than 10MB", 400));
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
});

export const deleteDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId, id } = req.params as { campaignId: string; id: string };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

  const doc = await prisma.ugcDocument.findUnique({ where: { id } });
  if (doc) {
    const absolutePath = getAbsoluteUploadPath(doc.url);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch { }
    }
  }

  await prisma.ugcDocument.delete({ where: { id } });

  res.status(200).json({ status: "success", message: "Document deleted successfully" });
});

/**
 * Notes Operations
 */
export const createNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId } = req.params as { campaignId: string };
  const { text } = req.body as { text: string };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

  const note = await prisma.ugcNote.create({
    data: { campaignId, text },
  });

  res.status(201).json({ status: "success", data: note });
});

export const deleteNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId, id } = req.params as { campaignId: string; id: string };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

  await prisma.ugcNote.delete({ where: { id } });

  res.status(200).json({ status: "success", message: "Note deleted successfully" });
});

/**
 * Feedback Messages
 */
export const createFeedback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { campaignId } = req.params as { campaignId: string };
  const { text, mediaId } = req.body as { text: string; mediaId?: string };

  const campaign = await checkCampaignAccess(campaignId, req);
  if (!campaign) return next(new AppError("Campaign not found or unauthorized", 404));

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
});

/**
 * ── GUEST PUBLIC ENDPOINTS ──────────────────────────────────────────────────
 */

/**
 * GET /api/ugc-campaigns/public/:slug — Retrieve public campaign
 */
export const getPublicCampaignBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params as { slug: string };

  const campaign = await prisma.ugcCampaign.findUnique({
    where: { slug },
    include: {
      deliverables: { orderBy: { createdAt: "asc" } },
      tasks: { orderBy: { createdAt: "asc" } },
      media: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "asc" } },
      notesComments: { orderBy: { createdAt: "desc" } },
      feedback: {
        orderBy: { createdAt: "asc" },
        include: { media: true },
      },
    },
  });

  if (!campaign) {
    return next(new AppError("Campaign not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: campaign,
  });
});

/**
 * PATCH /api/ugc-campaigns/public/:slug/media/:mediaId/status — Approve file
 */
export const updatePublicMediaStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug, mediaId } = req.params as { slug: string; mediaId: string };

  const campaign = await prisma.ugcCampaign.findUnique({ where: { slug } });
  if (!campaign) return next(new AppError("Campaign not found", 404));

  if (mediaId === "all") {
    await prisma.ugcMedia.updateMany({
      where: { campaignId: campaign.id },
      data: { status: "approved" },
    });
    return res.status(200).json({ status: "success", message: "All media items approved" });
  }

  const updatedMedia = await prisma.ugcMedia.update({
    where: { id: mediaId },
    data: { status: "approved" },
  });

  res.status(200).json({ status: "success", data: updatedMedia });
});

/**
 * POST /api/ugc-campaigns/public/:slug/media/:mediaId/request-changes — Request changes on media
 */
export const requestChangesPublicMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug, mediaId } = req.params as { slug: string; mediaId: string };
  const { text } = req.body as { text: string };

  const campaign = await prisma.ugcCampaign.findUnique({ where: { slug } });
  if (!campaign) return next(new AppError("Campaign not found", 404));

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

  res.status(200).json({ status: "success", data: message });
});

/**
 * POST /api/ugc-campaigns/public/:slug/feedback — Submit feedback chat from brand
 */
export const createPublicFeedback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params as { slug: string };
  const { text, mediaId } = req.body as { text: string; mediaId?: string };

  const campaign = await prisma.ugcCampaign.findUnique({ where: { slug } });
  if (!campaign) return next(new AppError("Campaign not found", 404));

  const message = await prisma.ugcFeedbackMessage.create({
    data: {
      campaignId: campaign.id,
      text,
      from: "brand",
      mediaId: mediaId || null,
    },
    include: { media: true },
  });

  res.status(201).json({ status: "success", data: message });
});

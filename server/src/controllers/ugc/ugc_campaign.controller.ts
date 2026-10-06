import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { safeUnlink } from "../../utils/upload.util.js";
import { logActivity } from "../../utils/activity.util.js";
import { generateSecureToken } from "../../utils/otp.util.js";
import { requireUserId } from "../../middlewares/auth.middleware.js";
import { appendPreviewToken, type AuthRequest } from "./ugc_helper.js";

/**
 * GET /api/ugc-campaigns — Retrieve creator's campaigns
 */
export const getUgcCampaigns = catchAsync(
  async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const role = (req as AuthRequest).user?.role;
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
  }
);

/**
 * GET /api/ugc-campaigns/:id — Retrieve full campaign details
 */
export const getUgcCampaignById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = requireUserId(req);
    const role = (req as AuthRequest).user?.role;
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
  }
);

/**
 * POST /api/ugc-campaigns — Create a new campaign
 */
export const createUgcCampaign = catchAsync(
  async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const role = (req as AuthRequest).user?.role;
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
  }
);

/**
 * PATCH /api/ugc-campaigns/:id — Update a campaign
 */
export const updateUgcCampaign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = requireUserId(req);
    const role = (req as AuthRequest).user?.role;
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
          await tx.ugcCampaignTask.update({
            where: { id: campaignDueDateTask.id },
            data: {
              ...(deadline !== undefined && { date: deadline }),
            },
          });

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

    // Log activity
    const ownerUserId = updated.userId;
    const brandLabel = updated.brandName.substring(0, 5).toUpperCase();

    if (status !== undefined && status !== existing.status) {
      const statusColors: Record<string, { bg: string; dot: string }> = {
        "Pending": { bg: "bg-yellow-100", dot: "bg-yellow-500" },
        "Active": { bg: "bg-blue-100", dot: "bg-blue-500" },
        "Under Review": { bg: "bg-orange-100", dot: "bg-orange-500" },
        "Approved": { bg: "bg-green-100", dot: "bg-green-500" },
        "Completed": { bg: "bg-emerald-100", dot: "bg-emerald-500" },
        "Draft": { bg: "bg-gray-100", dot: "bg-gray-400" },
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
  }
);

/**
 * DELETE /api/ugc-campaigns/:id — Delete a campaign
 */
export const deleteUgcCampaign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = requireUserId(req);
    const role = (req as AuthRequest).user?.role;
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
      safeUnlink(item.url);
    }

    const docs = await prisma.ugcDocument.findMany({
      where: { campaignId: id },
    });
    for (const doc of docs) {
      safeUnlink(doc.url);
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

      await tx.invoice.deleteMany({
        where: {
          userId: existing.userId,
          campaignId: id,
        },
      }).catch((err) => {
        console.warn("Failed to clean up associated invoices: ", err);
      });

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
  }
);

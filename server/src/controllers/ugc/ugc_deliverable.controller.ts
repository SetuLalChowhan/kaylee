import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { logActivity } from "../../utils/activity.util.js";
import { requireUserId } from "../../middlewares/auth.middleware.js";
import { checkCampaignAccess } from "./ugc_helper.js";

/**
 * POST /api/ugc-campaigns/:campaignId/deliverables — Create a deliverable
 */
export const createDeliverable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = requireUserId(req);
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
  }
);

/**
 * PATCH /api/ugc-campaigns/:campaignId/deliverables/:id — Update a deliverable
 */
export const updateDeliverable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };
    const { text, progress } = req.body as { text?: string; progress?: string[] };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const existingDeliverable = await prisma.ugcDeliverable.findFirst({
      where: { id, campaignId: campaign.id },
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
  }
);

/**
 * DELETE /api/ugc-campaigns/:campaignId/deliverables/:id — Delete a deliverable
 */
export const deleteDeliverable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const existingDeliverable = await prisma.ugcDeliverable.findFirst({
      where: { id, campaignId: campaign.id },
    });
    if (!existingDeliverable) return next(new AppError("Deliverable not found", 404));

    await prisma.ugcDeliverable.deleteMany({ where: { id, campaignId: campaign.id } });

    res
      .status(200)
      .json({ status: "success", message: "Deliverable deleted successfully" });
  }
);

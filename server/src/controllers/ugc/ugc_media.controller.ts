import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { normalizeUploadPath, safeUnlink } from "../../utils/upload.util.js";
import { checkCampaignAccess } from "./ugc_helper.js";

const ALLOWED_ASSET_TYPES = ["Video", "Raw Footage", "B-Roll", "Photo", "Graphic", "Audio", "Other"];

/**
 * POST /api/ugc-campaigns/:campaignId/media — Upload campaign media
 */
export const uploadMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId } = req.params as { campaignId: string };
    const { title, description, assetType } = req.body as {
      title?: string;
      description?: string;
      assetType?: string;
    };

    if (!req.file) return next(new AppError("Media file is required", 400));

    if (!assetType || !ALLOWED_ASSET_TYPES.includes(assetType)) {
      safeUnlink(req.file.path);
      return next(new AppError("Invalid or missing asset type categorization", 400));
    }

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign) {
      safeUnlink(req.file.path);
      return next(new AppError("Campaign not found or unauthorized", 404));
    }

    const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
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
  }
);

/**
 * PATCH /api/ugc-campaigns/:campaignId/media/:id/replace — Replace a single media item
 */
export const replaceMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };
    const { title, description, assetType } = req.body as {
      title?: string;
      description?: string;
      assetType?: string;
    };

    if (!req.file)
      return next(new AppError("Replacement file is required", 400));

    if (assetType && !ALLOWED_ASSET_TYPES.includes(assetType)) {
      safeUnlink(req.file.path);
      return next(new AppError("Invalid asset type categorization", 400));
    }

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign) {
      safeUnlink(req.file.path);
      return next(new AppError("Campaign not found or unauthorized", 404));
    }

    const existing = await prisma.ugcMedia.findFirst({
      where: { id, campaignId: campaign.id },
    });
    if (!existing) {
      safeUnlink(req.file.path);
      return next(new AppError("Media item not found in this campaign", 404));
    }

    const type = req.file.mimetype.startsWith("video/") ? "video" : "image";

    safeUnlink(existing.url);
    const url = normalizeUploadPath(req.file.path);

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
  }
);

/**
 * DELETE /api/ugc-campaigns/:campaignId/media/:id — Delete a media item
 */
export const deleteMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const media = await prisma.ugcMedia.findFirst({
      where: { id, campaignId: campaign.id },
    });
    if (!media) {
      return next(new AppError("Media not found in this campaign", 404));
    }

    safeUnlink(media.url);
    await prisma.ugcMedia.deleteMany({ where: { id, campaignId: campaign.id } });

    res
      .status(200)
      .json({ status: "success", message: "Media deleted successfully" });
  }
);

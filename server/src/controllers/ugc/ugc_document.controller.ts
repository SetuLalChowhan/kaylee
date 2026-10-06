import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { normalizeUploadPath, safeUnlink } from "../../utils/upload.util.js";
import { checkCampaignAccess } from "./ugc_helper.js";

/**
 * POST /api/ugc-campaigns/:campaignId/documents — Upload a document
 */
export const uploadDocument = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId } = req.params as { campaignId: string };
    const { title } = req.body as { title?: string };

    if (!req.file) return next(new AppError("Document file is required", 400));

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign) {
      safeUnlink(req.file.path);
      return next(new AppError("Campaign not found or unauthorized", 404));
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
  }
);

/**
 * DELETE /api/ugc-campaigns/:campaignId/documents/:id — Delete a document
 */
export const deleteDocument = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const doc = await prisma.ugcDocument.findFirst({
      where: { id, campaignId: campaign.id },
    });
    if (!doc) {
      return next(new AppError("Document not found in this campaign", 404));
    }

    safeUnlink(doc.url);
    await prisma.ugcDocument.deleteMany({ where: { id, campaignId: campaign.id } });

    res
      .status(200)
      .json({ status: "success", message: "Document deleted successfully" });
  }
);

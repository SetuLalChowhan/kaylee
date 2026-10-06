import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { normalizeUploadPath, safeUnlink } from "../../utils/upload.util.js";
import { checkCampaignAccess } from "./ugc_helper.js";

/**
 * POST /api/ugc-campaigns/:campaignId/notes — Create a note
 */
export const createNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId } = req.params as { campaignId: string };
    const { text } = req.body as { text: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const note = await prisma.ugcNote.create({
      data: { campaignId, text },
    });

    res.status(201).json({ status: "success", data: note });
  }
);

/**
 * DELETE /api/ugc-campaigns/:campaignId/notes/:id — Delete a note
 */
export const deleteNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const note = await prisma.ugcNote.findFirst({
      where: { id, campaignId: campaign.id },
    });
    if (!note) {
      return next(new AppError("Note not found in this campaign", 404));
    }

    await prisma.ugcNote.deleteMany({ where: { id, campaignId: campaign.id } });

    res
      .status(200)
      .json({ status: "success", message: "Note deleted successfully" });
  }
);

/**
 * POST /api/ugc-campaigns/:campaignId/feedback — Create creator feedback message
 */
export const createFeedback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId } = req.params as { campaignId: string };
    const { text, mediaId } = req.body as { text: string; mediaId?: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign) {
      if (req.file) safeUnlink(req.file.path);
      return next(new AppError("Campaign not found or unauthorized", 404));
    }

    if (mediaId) {
      const media = await prisma.ugcMedia.findFirst({
        where: { id: mediaId, campaignId: campaign.id },
      });
      if (!media) {
        if (req.file) safeUnlink(req.file.path);
        return next(new AppError("Associated media not found in this campaign", 404));
      }
    }

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
  }
);

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import prisma from "../config/db.js";
import { UPLOAD_ROOT } from "../utils/upload.util.js";

const INLINE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".mp4",
  ".mov",
  ".webm",
  ".mpeg",
  ".pdf",
];

function serveAuthorizedCampaignFile(res: Response, next: NextFunction, filename: string) {
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) {
    return res.status(404).json({
      status: "fail",
      message: "File not found.",
    });
  }

  const absPath = path.resolve(UPLOAD_ROOT, "campaigns", filename);
  const allowedPrefix = path.resolve(UPLOAD_ROOT, "campaigns") + path.sep;

  if (!absPath.startsWith(allowedPrefix)) {
    return res.status(404).json({
      status: "fail",
      message: "File not found.",
    });
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");

  const ext = path.extname(filename).toLowerCase();
  if (!INLINE_EXTENSIONS.includes(ext)) {
    res.setHeader("Content-Disposition", "attachment");
  }

  return res.sendFile(absPath, { dotfiles: "deny" }, (err: any) => {
    if (err) {
      if (err.code === "ENOENT") {
        if (!res.headersSent) {
          return res.status(404).json({
            status: "fail",
            message: "File not found.",
          });
        }
      } else {
        if (!res.headersSent) {
          return next(err);
        }
      }
    }
  });
}

export const downloadInterceptor = async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params;

  if (!filename || typeof filename !== "string" || !/^[A-Za-z0-9._-]+$/.test(filename)) {
    return res.status(404).json({
      status: "fail",
      message: "File not found.",
    });
  }

  const matchingUrls = [
    `uploads/campaigns/${filename}`,
    `/uploads/campaigns/${filename}`,
    filename,
  ];

  try {
    // 1. Look up exact file record in ugcMedia, ugcDocument, or ugcFeedbackMessage
    const campaignMedia = await prisma.ugcMedia.findFirst({
      where: { url: { in: matchingUrls } },
      include: { campaign: true },
    });

    let campaignDoc = null;
    let feedbackMsg = null;

    if (!campaignMedia) {
      campaignDoc = await prisma.ugcDocument.findFirst({
        where: { url: { in: matchingUrls } },
        include: { campaign: true },
      });
    }

    if (!campaignMedia && !campaignDoc) {
      feedbackMsg = await prisma.ugcFeedbackMessage.findFirst({
        where: { fileUrl: { in: matchingUrls } },
        include: { campaign: true },
      });
    }

    if (!campaignMedia && !campaignDoc && !feedbackMsg) {
      return res.status(404).json({
        status: "fail",
        message: "File not found.",
      });
    }

    const campaign = campaignMedia?.campaign || campaignDoc?.campaign || feedbackMsg?.campaign;
    if (!campaign) {
      return res.status(404).json({
        status: "fail",
        message: "Campaign not found.",
      });
    }

    // 2. If campaign releaseFiles is true, serve directly
    if (campaign.releaseFiles === true) {
      return serveAuthorizedCampaignFile(res, next, filename);
    }

    // 3. Otherwise, check authorization
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token && typeof req.query.token === "string") {
      token = req.query.token;
    }

    if (!token) {
      return res.status(403).json({
        status: "fail",
        message: "Access forbidden. Downloads are locked for this campaign.",
      });
    }

    // (a) Check if access token belongs to owner or admin
    try {
      const decodedAccess = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
      if (decodedAccess && typeof decodedAccess.userId === "string" && decodedAccess.type !== "preview") {
        if (decodedAccess.role === "admin" || decodedAccess.userId === campaign.userId) {
          return serveAuthorizedCampaignFile(res, next, filename);
        }
      }
    } catch {
      // Not a valid access token
    }

    // (b) For media only, allow valid preview token matching the campaignId
    if (campaignMedia) {
      try {
        const previewSecret = process.env.PREVIEW_TOKEN_SECRET || (process.env.ACCESS_TOKEN_SECRET as string);
        const decodedPreview = jwt.verify(token, previewSecret) as any;
        if (
          decodedPreview &&
          decodedPreview.type === "preview" &&
          decodedPreview.campaignId === campaign.id
        ) {
          return serveAuthorizedCampaignFile(res, next, filename);
        }
      } catch {
        // Invalid preview token
      }
    }

    return res.status(403).json({
      status: "fail",
      message: "Access forbidden. Downloads are locked for this campaign.",
    });
  } catch (err) {
    return next(err);
  }
};

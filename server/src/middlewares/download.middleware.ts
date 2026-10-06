import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const downloadInterceptor = async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params;

  if (!filename || typeof filename !== "string") {
    return res.status(404).json({
      status: "fail",
      message: "File not found.",
    });
  }

  const matchingUrls = [
    `uploads/campaigns/${filename}`,
    `/uploads/campaigns/${filename}`,
    filename
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

    res.setHeader("X-Content-Type-Options", "nosniff");

    // 2. If campaign releaseFiles is true, serve directly
    if (campaign.releaseFiles === true) {
      return next();
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
          return next();
        }
      }
    } catch {
      // Not a valid access token
    }

    // (b) For media only, allow valid preview token matching the campaignId
    if (campaignMedia) {
      try {
        const previewSecret = process.env.PREVIEW_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET as string;
        const decodedPreview = jwt.verify(token, previewSecret) as any;
        if (
          decodedPreview &&
          decodedPreview.type === "preview" &&
          decodedPreview.campaignId === campaign.id
        ) {
          return next();
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

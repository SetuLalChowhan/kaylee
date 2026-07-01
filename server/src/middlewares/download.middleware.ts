import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const downloadInterceptor = async (req: Request, res: Response, next: NextFunction) => {
  const { filename } = req.params;

  try {
    const campaignMedia = (await prisma.ugcMedia.findFirst({
      where: { url: { contains: filename as string } },
      include: { campaign: true },
    })) as any;

    const campaignDoc = !campaignMedia
      ? ((await prisma.ugcDocument.findFirst({
        where: { url: { contains: filename as string } },
        include: { campaign: true },
      })) as any)
      : null;

    const campaign = campaignMedia?.campaign || campaignDoc?.campaign;

    if (!campaign || campaign.releaseFiles === true) {
      return next();
    }

    // Check if the request is loaded inside our app (e.g. preview)
    const referer = req.headers.referer;
    const origin = req.headers.origin;
    const allowedHosts = [
      "localhost:5173",
      "localhost:5174",
      "stackd12.netlify.app",
      "stackdadmin.netlify.app",
      "stakd-client.vercel.app",
      "stakd-admin.vercel.app",
      "softvencealpha.com",
      "admin.getstakd.co",
      "getstakd.co",
      "api.getstakd.co",
    ];
    const isFromOurApp =
      (referer && allowedHosts.some(host => referer.includes(host))) ||
      (origin && allowedHosts.some(host => origin.includes(host)));

    console.log("Download Interceptor Debug:", {
      filename,
      referer,
      origin,
      isFromOurApp,
    });

    if (isFromOurApp) {
      return next();
    }

    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(403).json({
        status: "fail",
        message: "Access forbidden. Downloads are locked for this campaign.",
      });
    }

    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
      return next();
    } catch (err) {
      return res.status(403).json({
        status: "fail",
        message: "Access forbidden. Invalid token.",
      });
    }
  } catch (err) {
    return next(err);
  }
};

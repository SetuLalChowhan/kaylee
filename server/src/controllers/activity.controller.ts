import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { requireUserId } from "../middlewares/auth.middleware.js";

/**
 * GET /api/activities - Fetch recent activities for authenticated user with pagination
 */
export const getUserActivities = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = requireUserId(req);

  const parsedPage = parseInt(req.query.page as string, 10);
  const page = !isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const parsedLimit = parseInt(req.query.limit as string, 10);
  const limit = !isNaN(parsedLimit) && parsedLimit >= 1 ? Math.min(parsedLimit, 100) : 15;

  const skip = (page - 1) * limit;

  let activities: any[] = [];
  let total = 0;
  try {
    total = await (prisma as any).activity.count({ where: { userId } });
    activities = await (prisma as any).activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
  } catch (err) {
    console.warn("Activity query error:", err);
    activities = [];
  }

  const hasMore = skip + activities.length < total;

  res.status(200).json({
    status: "success",
    data: activities,
    pagination: {
      page,
      limit,
      total,
      hasMore,
    },
  });
});

/**
 * POST /api/activities - Create a custom activity
 */
export const createActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const { title, sub, avatarBg, avatarText, dotColor, type, campaignId } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return next(new AppError("Activity title is required", 400));
  }

  // If campaignId is provided, verify caller owns the campaign
  if (campaignId) {
    const campaign = await prisma.ugcCampaign.findFirst({
      where: { id: String(campaignId), userId },
    });
    if (!campaign) {
      return next(new AppError("Campaign not found or access denied", 404));
    }
  }

  let activity;
  try {
    activity = await (prisma as any).activity.create({
      data: {
        userId,
        title: title.trim(),
        sub: sub ? String(sub).trim() : "",
        avatarBg: avatarBg ? String(avatarBg).trim() : "bg-[#FCE4EC]",
        avatarText: avatarText ? String(avatarText).trim() : "STAKD",
        dotColor: dotColor ? String(dotColor).trim() : null,
        type: type ? String(type).trim() : "GENERAL",
        campaignId: campaignId ? String(campaignId) : null,
      },
    });
  } catch (err) {
    return next(new AppError("Failed to create activity", 500));
  }

  res.status(201).json({
    status: "success",
    message: "Activity created successfully",
    data: activity,
  });
});

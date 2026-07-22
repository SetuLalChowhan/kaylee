import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

/**
 * GET /api/activities - Fetch recent activities for authenticated user with pagination
 */
export const getUserActivities = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
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
  const { userId } = (req as AuthRequest).user;
  const { title, sub, avatarBg, avatarText, dotColor, type, campaignId } = req.body;

  if (!title) {
    return next(new AppError("Activity title is required", 400));
  }

  let activity;
  try {
    activity = await (prisma as any).activity.create({
      data: {
        userId,
        title,
        sub: sub || "",
        avatarBg: avatarBg || "bg-[#FCE4EC]",
        avatarText: avatarText || "STAKD",
        dotColor: dotColor || null,
        type: type || "GENERAL",
        campaignId: campaignId || null,
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

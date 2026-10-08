import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { requireUserId } from "../middlewares/auth.middleware.js";
import { checkAndTriggerDeadlineReminders, checkAndTriggerTaskReminders } from "../utils/notification.util.js";

export const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = requireUserId(req);

  // Auto-check and trigger deadline (48h) and task reminders for this user
  await checkAndTriggerDeadlineReminders(userId);
  await checkAndTriggerTaskReminders(userId);

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    status: "success",
    data: notifications,
  });
});

export const markAsSeen = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const id = req.params.id as string;

  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) return next(new AppError("Notification not found", 404));

  const updated = await prisma.notification.update({
    where: { id },
    data: { isSeen: true },
  });

  res.status(200).json({
    status: "success",
    message: "Notification marked as seen",
    data: updated,
  });
});

export const markAllAsSeen = catchAsync(async (req: Request, res: Response) => {
  const userId = requireUserId(req);

  await prisma.notification.updateMany({
    where: {
      userId,
      isSeen: false,
    },
    data: {
      isSeen: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "All notifications marked as seen",
  });
});

export const deleteNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const id = req.params.id as string;

  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) return next(new AppError("Notification not found", 404));

  await prisma.notification.delete({
    where: { id },
  });

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully",
  });
});

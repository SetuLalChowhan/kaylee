import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { comparePassword, hashPassword } from "../utils/auth.util.js";
import fs from "fs";

// Typed request with authenticated user payload
interface AuthRequest extends Request {
  user: { userId: string };
}

/**
 * GET /api/user/me — Fetch the authenticated user's profile
 */
export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatar: true, isVerified: true },
  });

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ status: "success", data: user });
});

/**
 * PATCH /api/user/update — Update profile name and/or avatar
 */
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { name } = req.body as { name?: string };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  let avatarUrl = user.avatar;

  if (req.file) {
    // Delete old local avatar to free disk space
    if (user.avatar?.startsWith("uploads/") && fs.existsSync(user.avatar)) {
      fs.unlinkSync(user.avatar);
    }
    // Normalise path separators (Windows → POSIX)
    avatarUrl = req.file.path.replace(/\\/g, "/");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      avatar: avatarUrl,
    },
    select: { id: true, name: true, email: true, avatar: true },
  });

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

/**
 * PATCH /api/user/change-password — Change the authenticated user's password
 */
export const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };

  if (!oldPassword || !newPassword) {
    return next(new AppError("Please provide old and new password", 400));
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) return next(new AppError("Incorrect old password", 400));

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res.status(200).json({
    status: "success",
    message: "Password changed successfully!",
  });
});
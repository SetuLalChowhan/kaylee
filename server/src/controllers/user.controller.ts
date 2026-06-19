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
    select: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      shortBio: true,
      servicesOffered: true,
      brandLogos: true,
      socialLinks: true,
      email: true,
      avatar: true,
      isVerified: true,
    },
  });

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ status: "success", data: user });
});

/**
 * PATCH /api/user/update — Update profile (firstName, lastName, servicesOffered, brandLogos) and/or avatar
 */
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { firstName, lastName, servicesOffered } = req.body as {
    firstName?: string;
    lastName?: string;
    servicesOffered?: string;
  };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  let avatarUrl = user.avatar;

  // Handle avatar (single file) and brandLogos (array of files)
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  const avatarFile = files?.avatar?.[0];
  if (avatarFile) {
    if (user.avatar?.startsWith("uploads/") && fs.existsSync(user.avatar)) {
      fs.unlinkSync(user.avatar);
    }
    avatarUrl = avatarFile.path.replace(/\\/g, "/");
  }

  let brandLogoUrls: string[] = [];
  if (files?.brandLogos?.length) {
    brandLogoUrls = files.brandLogos.map((f) => f.path.replace(/\\/g, "/"));
  }

  // If brandLogos sent via JSON (array of existing URLs), parse them
  let parsedBrandLogos: string[] | undefined;
  if (req.body.brandLogos) {
    if (typeof req.body.brandLogos === "string") {
      try {
        parsedBrandLogos = JSON.parse(req.body.brandLogos);
      } catch {
        parsedBrandLogos = undefined;
      }
    } else if (Array.isArray(req.body.brandLogos)) {
      parsedBrandLogos = req.body.brandLogos;
    }
  }

  const finalBrandLogos = brandLogoUrls.length > 0 ? brandLogoUrls : parsedBrandLogos;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(servicesOffered !== undefined && { servicesOffered }),
      ...(finalBrandLogos !== undefined && { brandLogos: finalBrandLogos }),
      avatar: avatarUrl,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      servicesOffered: true,
      brandLogos: true,
      email: true,
      avatar: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: updatedUser,
  });
});


export const completeOnboarding = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { displayName, shortBio, socialLinks } = req.body as {
    displayName?: string;
    shortBio?: string;
    socialLinks?: { instagram?: string; website?: string; youtube?: string; other?: string };
  };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  let avatarUrl = user.avatar;

  if (req.file) {
    if (user.avatar?.startsWith("uploads/") && fs.existsSync(user.avatar)) {
      fs.unlinkSync(user.avatar);
    }
    avatarUrl = req.file.path.replace(/\\/g, "/");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(displayName && { displayName }),
      ...(shortBio !== undefined && { shortBio }),
      ...(socialLinks && { socialLinks }),
      avatar: avatarUrl,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      shortBio: true,
      socialLinks: true,
      avatar: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Onboarding completed successfully",
    data: updatedUser,
  });
});

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
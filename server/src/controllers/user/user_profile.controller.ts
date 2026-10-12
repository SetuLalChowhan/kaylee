import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { comparePassword, hashPassword } from "../../utils/auth.util.js";
import { normalizeUploadPath, safeUnlink } from "../../utils/upload.util.js";
import { logActivity } from "../../utils/activity.util.js";
import { StripeService } from "../../services/stripe.service.js";
import { requireUserId } from "../../middlewares/auth.middleware.js";
import { BRAND_LOGO_REGEX, cleanUserPhysicalFiles, generateUniqueSlug } from "./user_helper.js";

/**
 * GET /api/user/me — Fetch the authenticated user's profile
 */
export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);

  let user: any;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        slug: true,
        shortBio: true,
        servicesOffered: true,
        brandLogos: true,
        socialLinks: true,
        email: true,
        avatar: true,
        isVerified: true,
        role: true,
        notifyDeadlineReminders: true,
        notifyInvoiceUpdates: true,
        notifyContentApprovals: true,
        notifyTaskReminders: true,
        showClientRating: true,
      },
    });
  } catch {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        slug: true,
        shortBio: true,
        servicesOffered: true,
        brandLogos: true,
        socialLinks: true,
        email: true,
        avatar: true,
        isVerified: true,
        role: true,
        notifyDeadlineReminders: true,
        notifyInvoiceUpdates: true,
        notifyContentApprovals: true,
        notifyTaskReminders: true,
      },
    });
  }

  if (!user) return next(new AppError("User not found", 404));

  // Compute rating for the user from completed UGC campaigns
  const ratedCampaigns = await prisma.ugcCampaign.findMany({
    where: {
      userId,
      rating: { not: null },
    },
    select: { rating: true },
  });
  const totalRatings = ratedCampaigns.length;
  const avgRatingValue = totalRatings > 0
    ? (ratedCampaigns.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / totalRatings).toFixed(1)
    : "0";

  let userSocial: Record<string, any> = {};
  if (typeof user.socialLinks === "string") {
    try {
      userSocial = JSON.parse(user.socialLinks);
    } catch {
      userSocial = {};
    }
  } else if (user.socialLinks && typeof user.socialLinks === "object") {
    userSocial = user.socialLinks as Record<string, any>;
  }

  const isRatingVisible = (user as any).showClientRating !== undefined && (user as any).showClientRating !== null
    ? Boolean((user as any).showClientRating)
    : userSocial?.showClientRating !== undefined
      ? Boolean(userSocial.showClientRating)
      : true;

  res.status(200).json({
    status: "success",
    data: {
      ...user,
      showClientRating: isRatingVisible,
      clientSatisfaction: avgRatingValue,
      ratingCount: totalRatings,
    },
  });
});

/**
 * PATCH /api/user/update — Update profile (firstName, lastName, servicesOffered, brandLogos) and/or avatar
 */
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const { firstName, lastName, servicesOffered, displayName, shortBio, socialLinks, showClientRating } = req.body as {
    firstName?: string;
    lastName?: string;
    servicesOffered?: string;
    displayName?: string;
    shortBio?: string;
    socialLinks?: { instagram?: string; website?: string; youtube?: string; other?: string; showClientRating?: boolean };
    showClientRating?: boolean | string;
  };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  let finalSlug = user.slug;
  if (displayName) {
    finalSlug = await generateUniqueSlug(displayName, userId);
  } else if (!finalSlug && user.displayName) {
    finalSlug = await generateUniqueSlug(user.displayName, userId);
  }

  let avatarUrl = user.avatar;

  // Handle avatar (single file) and brandLogos (array of files)
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  const avatarFile = files?.avatar?.[0];
  if (avatarFile) {
    if (user.avatar) {
      safeUnlink(user.avatar);
    }
    avatarUrl = normalizeUploadPath(avatarFile.path);
  }

  // Strict brand logos validation against path traversal
  const userStoredBrandLogos: string[] = Array.isArray(user.brandLogos)
    ? (user.brandLogos as string[])
    : [];

  let existingBrandLogos: string[] = [];

  // 1. If client sent a list of existing logo paths, only keep ones that match safe regex AND currently exist in user record
  if (req.body.brandLogos) {
    let parsedLogos: any = req.body.brandLogos;
    if (typeof parsedLogos === "string") {
      try {
        parsedLogos = JSON.parse(parsedLogos);
      } catch {
        parsedLogos = [];
      }
    }
    if (Array.isArray(parsedLogos)) {
      existingBrandLogos = parsedLogos.filter(
        (logo: unknown) =>
          typeof logo === "string" &&
          BRAND_LOGO_REGEX.test(logo) &&
          userStoredBrandLogos.includes(logo)
      );
    }
  } else {
    existingBrandLogos = userStoredBrandLogos;
  }

  // 2. Append newly uploaded files
  const newLogoPaths: string[] = [];
  if (files?.brandLogos?.length) {
    files.brandLogos.forEach((f) => {
      newLogoPaths.push(normalizeUploadPath(f.path));
    });
  }

  const finalBrandLogos = [...existingBrandLogos, ...newLogoPaths];

  // Parse showClientRating boolean if supplied
  const parsedShowClientRating = showClientRating !== undefined
    ? (typeof showClientRating === "string" ? showClientRating === "true" || showClientRating === "1" : Boolean(showClientRating))
    : undefined;

  let existingSocialLinks: Record<string, any> = {};
  if (typeof user.socialLinks === "string") {
    try {
      existingSocialLinks = JSON.parse(user.socialLinks);
    } catch {
      existingSocialLinks = {};
    }
  } else if (user.socialLinks && typeof user.socialLinks === "object") {
    existingSocialLinks = { ...(user.socialLinks as Record<string, any>) };
  }

  let incomingSocialLinks: Record<string, any> = {};
  if (typeof socialLinks === "string") {
    try {
      incomingSocialLinks = JSON.parse(socialLinks);
    } catch {
      incomingSocialLinks = {};
    }
  } else if (socialLinks && typeof socialLinks === "object") {
    incomingSocialLinks = { ...socialLinks };
  }

  const finalSocialLinks = {
    ...existingSocialLinks,
    ...incomingSocialLinks,
    ...(parsedShowClientRating !== undefined ? { showClientRating: parsedShowClientRating } : {}),
  };

  let updatedUser: any;
  try {
    updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(displayName && { displayName }),
        ...(finalSlug !== undefined && { slug: finalSlug || null }),
        ...(servicesOffered !== undefined && { servicesOffered }),
        ...(finalBrandLogos !== undefined && { brandLogos: finalBrandLogos }),
        ...(shortBio !== undefined && { shortBio }),
        socialLinks: finalSocialLinks,
        ...(parsedShowClientRating !== undefined && { showClientRating: parsedShowClientRating }),
        avatar: avatarUrl,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        slug: true,
        shortBio: true,
        socialLinks: true,
        servicesOffered: true,
        brandLogos: true,
        email: true,
        avatar: true,
        role: true,
        showClientRating: true,
      },
    });
  } catch {
    updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(displayName && { displayName }),
        ...(finalSlug !== undefined && { slug: finalSlug || null }),
        ...(servicesOffered !== undefined && { servicesOffered }),
        ...(finalBrandLogos !== undefined && { brandLogos: finalBrandLogos }),
        ...(shortBio !== undefined && { shortBio }),
        socialLinks: finalSocialLinks,
        avatar: avatarUrl,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        slug: true,
        shortBio: true,
        socialLinks: true,
        servicesOffered: true,
        brandLogos: true,
        email: true,
        avatar: true,
        role: true,
      },
    });
  }

  let updatedSocial: Record<string, any> = {};
  if (typeof updatedUser.socialLinks === "string") {
    try {
      updatedSocial = JSON.parse(updatedUser.socialLinks);
    } catch {}
  } else if (updatedUser.socialLinks && typeof updatedUser.socialLinks === "object") {
    updatedSocial = updatedUser.socialLinks as Record<string, any>;
  }

  const isRatingVisible = updatedUser.showClientRating !== undefined && updatedUser.showClientRating !== null
    ? Boolean(updatedUser.showClientRating)
    : updatedSocial?.showClientRating !== undefined
      ? Boolean(updatedSocial.showClientRating)
      : (parsedShowClientRating !== undefined ? parsedShowClientRating : true);

  // Compute dynamic satisfaction rating
  const ratedCampaigns = await prisma.ugcCampaign.findMany({
    where: {
      userId,
      rating: { not: null },
    },
    select: { rating: true },
  });
  const totalRatings = ratedCampaigns.length;
  const avgRatingValue = totalRatings > 0
    ? (ratedCampaigns.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / totalRatings).toFixed(1)
    : "0";

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      ...updatedUser,
      showClientRating: isRatingVisible,
      clientSatisfaction: avgRatingValue,
      ratingCount: totalRatings,
    },
  });

  logActivity({
    userId,
    title: "Profile updated",
    sub: updatedUser.displayName || `${updatedUser.firstName} ${updatedUser.lastName}`,
    avatarBg: "bg-teal-100",
    avatarText: "PROF",
    dotColor: "bg-teal-500",
    type: "PROFILE",
  });
});

/**
 * PATCH /api/user/onboarding — Complete user onboarding
 */
export const completeOnboarding = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const { displayName, shortBio, socialLinks } = req.body as {
    displayName?: string;
    shortBio?: string;
    socialLinks?: { instagram?: string; website?: string; youtube?: string; other?: string };
  };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  let finalSlug = user.slug;
  if (displayName) {
    finalSlug = await generateUniqueSlug(displayName, userId);
  }

  let avatarUrl = user.avatar;

  if (req.file) {
    if (user.avatar) {
      safeUnlink(user.avatar);
    }
    avatarUrl = normalizeUploadPath(req.file.path);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(displayName && { displayName }),
      ...(finalSlug && { slug: finalSlug }),
      ...(shortBio !== undefined && { shortBio }),
      ...(socialLinks && { socialLinks }),
      avatar: avatarUrl,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      slug: true,
      shortBio: true,
      socialLinks: true,
      avatar: true,
      role: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Onboarding completed successfully",
    data: updatedUser,
  });
});

/**
 * DELETE /api/user/brand-logo — Delete a single brand logo by its file path
 */
export const deleteBrandLogo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const { filePath } = req.body as { filePath: string };

  if (!filePath || !BRAND_LOGO_REGEX.test(filePath)) {
    return next(new AppError("Invalid brand logo file path", 400));
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  const currentLogos: string[] = Array.isArray(user.brandLogos) ? (user.brandLogos as string[]) : [];

  // Remove the file path from the array
  const updatedLogos = currentLogos.filter((logo) => logo !== filePath);

  // If it was removed, safely delete the physical file
  if (updatedLogos.length < currentLogos.length) {
    safeUnlink(filePath);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { brandLogos: updatedLogos },
    select: {
      id: true,
      brandLogos: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Brand logo deleted successfully",
    data: updatedUser,
  });
});

/**
 * PATCH /api/user/change-password — Change password
 */
export const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
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
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  logActivity({
    userId,
    title: "Password changed",
    sub: "Security credentials updated",
    avatarBg: "bg-purple-100",
    avatarText: "PASS",
    dotColor: "bg-purple-500",
    type: "SECURITY",
  });

  res.status(200).json({
    status: "success",
    message: "Password changed successfully!",
  });
});

/**
 * PATCH /api/user/notification-settings — Update notification preferences
 */
export const updateNotificationSettings = catchAsync(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const { notifyDeadlineReminders, notifyInvoiceUpdates, notifyContentApprovals, notifyTaskReminders } = req.body as {
    notifyDeadlineReminders?: boolean;
    notifyInvoiceUpdates?: boolean;
    notifyContentApprovals?: boolean;
    notifyTaskReminders?: boolean;
  };

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(notifyDeadlineReminders !== undefined && { notifyDeadlineReminders }),
      ...(notifyInvoiceUpdates !== undefined && { notifyInvoiceUpdates }),
      ...(notifyContentApprovals !== undefined && { notifyContentApprovals }),
      ...(notifyTaskReminders !== undefined && { notifyTaskReminders }),
    },
    select: {
      notifyDeadlineReminders: true,
      notifyInvoiceUpdates: true,
      notifyContentApprovals: true,
      notifyTaskReminders: true,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Notification settings updated successfully",
    data: updatedUser,
  });
});

/**
 * DELETE /api/user/delete-account — Authenticated user permanently deletes their own account
 */
export const deleteAccount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  // 1. Cancel Stripe subscription if active
  if (user.stripeSubscriptionId) {
    try {
      await StripeService.cancelSubscriptionImmediately(user.stripeSubscriptionId);
    } catch (err) {
      console.error("Error cancelling Stripe subscription on deleteAccount: ", err);
    }
  }

  // 2. Physically delete all files of the user
  await cleanUserPhysicalFiles(userId);

  // 3. Cascade delete database records
  await prisma.user.delete({ where: { id: userId } });

  // 4. Clear auth cookies
  res.clearCookie("token");
  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Your account and all associated data have been permanently deleted.",
  });
});

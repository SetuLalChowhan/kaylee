import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { comparePassword, hashPassword } from "../utils/auth.util.js";
import fs from "fs";

// Typed request with authenticated user payload
interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

/**
 * Helper to generate a unique lowercase URL slug from a display name
 */
async function generateUniqueSlug(displayName: string, userId: string): Promise<string> {
  const baseSlug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  
  let finalSlug = baseSlug || "user";
  let isUnique = false;
  let count = 0;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { slug: true } });
  if (user && user.slug === finalSlug) {
    return finalSlug;
  }

  while (!isUnique) {
    const candidateSlug = count === 0 ? finalSlug : `${finalSlug}-${count}`;
    const existingUser = await prisma.user.findFirst({
      where: {
        slug: candidateSlug,
        id: { not: userId }
      }
    });
    if (!existingUser) {
      finalSlug = candidateSlug;
      isUnique = true;
    } else {
      count++;
    }
  }
  return finalSlug;
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
      role: true,
      notifyDeadlineReminders: true,
      notifyInvoiceUpdates: true,
      notifyContentApprovals: true,
      notifyTaskReminders: true,
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
  const { firstName, lastName, servicesOffered, displayName, shortBio, socialLinks } = req.body as {
    firstName?: string;
    lastName?: string;
    servicesOffered?: string;
    displayName?: string;
    shortBio?: string;
    socialLinks?: { instagram?: string; website?: string; youtube?: string; other?: string };
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
    if (user.avatar?.startsWith("uploads/") && fs.existsSync(user.avatar)) {
      fs.unlinkSync(user.avatar);
    }
    avatarUrl = avatarFile.path.replace(/\\/g, "/");
  }

  // Merge existing + new brand logos
  let existingBrandLogos: string[] = Array.isArray(user.brandLogos) ? (user.brandLogos as string[]) : [];

  // 1. If client sent a JSON array of EXISTING logo paths (after deletions), use that as the base
  if (req.body.brandLogos) {
    if (typeof req.body.brandLogos === "string") {
      try {
        existingBrandLogos = JSON.parse(req.body.brandLogos);
      } catch {
        // ignore parse errors
      }
    } else if (Array.isArray(req.body.brandLogos)) {
      existingBrandLogos = req.body.brandLogos;
    }
  }

  // 2. Append newly uploaded files
  const newLogoPaths: string[] = [];
  if (files?.brandLogos?.length) {
    files.brandLogos.forEach((f) => {
      newLogoPaths.push(f.path.replace(/\\/g, "/"));
    });
  }

  const finalBrandLogos = [...existingBrandLogos, ...newLogoPaths];

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(displayName && { displayName }),
      ...(finalSlug !== undefined && { slug: finalSlug || null }),
      ...(servicesOffered !== undefined && { servicesOffered }),
      ...(finalBrandLogos !== undefined && { brandLogos: finalBrandLogos }),
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

  let finalSlug = user.slug;
  if (displayName) {
    finalSlug = await generateUniqueSlug(displayName, userId);
  }

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
  const { userId } = (req as AuthRequest).user;
  const { filePath } = req.body as { filePath: string };

  if (!filePath) return next(new AppError("filePath is required", 400));

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return next(new AppError("User not found", 404));

  const currentLogos: string[] = Array.isArray(user.brandLogos) ? (user.brandLogos as string[]) : [];

  // Remove the file path from the array
  const updatedLogos = currentLogos.filter((logo) => logo !== filePath);

  // If it was removed, also delete the physical file
  if (updatedLogos.length < currentLogos.length) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
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

export const updateNotificationSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
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
    }
  });

  res.status(200).json({
    status: "success",
    message: "Notification settings updated successfully",
    data: updatedUser
  });
});

/**
 * GET /api/user/dashboard-stats — Retrieve authenticated user's dashboard metrics
 */
export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, role } = (req as AuthRequest).user;
  const isAdmin = role === "admin";

  // 1. Stats Card calculations
  const activeCampaignsCount = await prisma.ugcCampaign.count({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: { in: ["Active", "Approved", "Pending"] }
    }
  });

  const awaitingReviewCount = await prisma.ugcCampaign.count({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: "Under Review"
    }
  });

  const completedCampaignsCount = await prisma.ugcCampaign.count({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: "Completed"
    }
  });

  const campaigns = await prisma.ugcCampaign.findMany({
    where: isAdmin ? {} : { userId },
    select: { amount: true, status: true, paymentStatus: true }
  });

  const totalEarnedValue = campaigns
    .filter(c => c.status === "Completed" || c.paymentStatus === "Paid")
    .reduce((sum, c) => {
      const cleanAmount = c.amount.replace(/[^0-9.]/g, "");
      const amt = parseFloat(cleanAmount) || 0;
      return sum + amt;
    }, 0);

  // 2. Recent Active/Draft campaigns (up to 4)
  const recentCampaigns = await prisma.ugcCampaign.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: { updatedAt: "desc" },
    take: 4
  });

  // 3. Upcoming Deadlines (up to 5)
  const activeCampaignsForDeadlines = await prisma.ugcCampaign.findMany({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: { not: "Completed" },
      deadline: { not: "" }
    },
    select: {
      id: true,
      name: true,
      brandName: true,
      deadline: true
    }
  });

  const parsedDeadlines = activeCampaignsForDeadlines
    .map(c => {
      const date = new Date(c.deadline);
      return {
        id: c.id,
        title: c.brandName,
        sub: c.name,
        date,
        day: isNaN(date.getTime()) ? "" : date.getDate().toString().padStart(2, "0"),
        month: isNaN(date.getTime()) ? "" : date.toLocaleString("en-US", { month: "short" })
      };
    })
    .filter(d => d.day !== "")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)
    .map(({ id, title, sub, day, month }) => ({ id, title, sub, day, month }));

  // 4. Pending & Upcoming Tasks from Planner (up to 5)
  const tasks = await prisma.task.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: { date: "asc" }
  });

  const parsedTasks = tasks
    .map(t => {
      const dateObj = new Date(t.date);
      let formattedDate = t.date;
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" });
      }
      return {
        id: t.id,
        title: t.name,
        sub: t.campaign,
        date: formattedDate,
        rawDate: t.date,
        completed: t.completed
      };
    })
    .sort((a, b) => {
      // Sort in-completed first, then by date
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const dateA = new Date(a.rawDate).getTime();
      const dateB = new Date(b.rawDate).getTime();
      return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    })
    .slice(0, 5);

  res.status(200).json({
    status: "success",
    data: {
      stats: {
        activeCampaigns: activeCampaignsCount,
        awaitingReview: awaitingReviewCount,
        completedCampaigns: completedCampaignsCount,
        totalEarned: totalEarnedValue
      },
      recentCampaigns,
      deadlines: parsedDeadlines,
      tasks: parsedTasks
    }
  });
});

/**
 * GET /api/user/admin/users — Retrieve all registered users (Admin-only)
 */
export const adminGetAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      slug: true
    }
  });

  res.status(200).json({
     status: "success",
     data: users
  });
});

/**
 * POST /api/user/admin/users — Admin creates a new user directly (Admin-only)
 */
export const adminCreateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password, role } = req.body as {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role?: string;
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return next(new AppError("User already exists with this email", 400));

  const pwd = password || "user123";
  const hashedPassword = await hashPassword(pwd);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "user",
      isVerified: true
    }
  });

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: newUser
  });
});

/**
 * PATCH /api/user/admin/users/:id — Admin updates any user's profile or role (Admin-only)
 */
export const adminUpdateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const { firstName, lastName, displayName, role, isVerified } = req.body as {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    role?: string;
    isVerified?: boolean;
  };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return next(new AppError("User not found", 404));

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(displayName !== undefined && { displayName }),
      ...(role !== undefined && { role }),
      ...(isVerified !== undefined && { isVerified })
    }
  });

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: updatedUser
  });
});

/**
 * DELETE /api/user/admin/users/:id — Admin deletes any user (Admin-only)
 */
export const adminDeleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return next(new AppError("User not found", 404));

  // Protect the user from deleting themselves
  const { userId } = (req as AuthRequest).user;
  if (id === userId) {
    return next(new AppError("You cannot delete your own admin account", 400));
  }

  await prisma.user.delete({ where: { id } });

  res.status(200).json({
    status: "success",
    message: "User deleted successfully"
  });
});

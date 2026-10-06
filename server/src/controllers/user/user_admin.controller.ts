import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { hashPassword } from "../../utils/auth.util.js";
import { PlanService } from "../../services/plan.service.js";
import { StripeService } from "../../services/stripe.service.js";
import { generateSecureToken } from "../../utils/otp.util.js";
import { sendEmail } from "../../services/email.service.js";
import { requireUserId } from "../../middlewares/auth.middleware.js";
import { cleanUserPhysicalFiles } from "./user_helper.js";

/**
 * GET /api/user/admin/users — Retrieve all registered users (Admin-only)
 */
export const adminGetAllUsers = catchAsync(async (_req: Request, res: Response) => {
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
      slug: true,
      planId: true,
      plan: {
        select: {
          id: true,
          title: true,
          price: true,
          campaignLimit: true,
        },
      },
    },
  });

  res.status(200).json({
    status: "success",
    data: users,
  });
});

/**
 * POST /api/user/admin/users — Admin creates a new user directly (Admin-only)
 */
export const adminCreateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, password, role, planId } = req.body as {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role?: string;
    planId?: string | null;
  };

  if (!email || !firstName || !lastName) {
    return next(new AppError("First name, last name, and email are required", 400));
  }

  const assignedRole = role === "admin" ? "admin" : "user";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return next(new AppError("User already exists with this email", 400));

  let plainPassword = password;
  const isGeneratedPassword = !plainPassword || plainPassword.trim() === "";

  if (isGeneratedPassword) {
    plainPassword = generateSecureToken(16);
  }

  const hashedPassword = await hashPassword(plainPassword!);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: assignedRole,
      isVerified: true,
      ...(planId && { planId }),
    },
    include: {
      plan: true,
    },
  });

  if (planId) {
    await prisma.subscription.upsert({
      where: { userId: newUser.id },
      create: {
        userId: newUser.id,
        planId,
        status: "ACTIVE",
      },
      update: {
        planId,
        status: "ACTIVE",
      },
    });

    await PlanService.getFoundingClaimedCount();
  }

  if (isGeneratedPassword) {
    // Send email with credentials/reset instructions
    await sendEmail(
      email,
      "Your STAKD Account Credentials",
      `<p>Hello ${firstName},</p><p>An administrator has created your account on STAKD. Your temporary password is: <strong>${plainPassword}</strong></p><p>Please log in and update your password immediately.</p>`
    );
  }

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    },
  });
});

/**
 * PATCH /api/user/admin/users/:id — Admin updates any user's profile or role (Admin-only)
 */
export const adminUpdateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const { firstName, lastName, displayName, role, isVerified, planId } = req.body as {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    role?: string;
    isVerified?: boolean;
    planId?: string | null;
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
      ...(isVerified !== undefined && { isVerified }),
      ...(planId !== undefined && { planId: planId || null }),
    },
    include: {
      plan: true,
    },
  });

  if (planId !== undefined) {
    await prisma.subscription.upsert({
      where: { userId: id },
      create: {
        userId: id,
        planId: planId || null,
        status: "ACTIVE",
      },
      update: {
        planId: planId || null,
        status: "ACTIVE",
      },
    });

    await PlanService.getFoundingClaimedCount();
  }

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: updatedUser,
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
  const userId = requireUserId(req);
  if (id === userId) {
    return next(new AppError("You cannot delete your own admin account", 400));
  }

  if (user.stripeSubscriptionId) {
    try {
      await StripeService.cancelSubscriptionImmediately(user.stripeSubscriptionId);
    } catch (err) {
      console.error("Error cancelling Stripe subscription on adminDeleteUser: ", err);
    }
  }

  // 1. Physically delete all files of the user
  await cleanUserPhysicalFiles(id);

  // 2. Cascade delete database records
  await prisma.user.delete({ where: { id } });

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

/**
 * GET /api/plans — Get all pricing plans sorted by price
 */
export const getPlans = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" }
  });

  res.status(200).json({
    status: "success",
    data: plans
  });
});

/**
 * POST /api/plans — Create a new pricing plan (Admin only)
 */
export const createPlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, price, priceSuffix, features, buttonText, isRecommended, isDark, stripePriceId, campaignLimit } = req.body as {
    title: string;
    description: string;
    price: number;
    priceSuffix: string;
    features: string[];
    buttonText?: string;
    isRecommended?: boolean;
    isDark?: boolean;
    stripePriceId?: string;
    campaignLimit?: number;
  };

  if (!title || price === undefined) {
    return next(new AppError("Title and Price are required", 400));
  }

  const plan = await prisma.plan.create({
    data: {
      title,
      description: description || "",
      price: Number(price),
      priceSuffix: priceSuffix || "",
      features: features || [],
      buttonText: buttonText || "Select Plan",
      isRecommended: !!isRecommended,
      isDark: !!isDark,
      stripePriceId: stripePriceId || null,
      campaignLimit: campaignLimit !== undefined ? Number(campaignLimit) : 2
    } as any
  });

  res.status(201).json({
    status: "success",
    message: "Plan created successfully",
    data: plan
  });
});

/**
 * PATCH /api/plans/:id — Update a pricing plan (Admin only)
 */
export const updatePlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const { title, description, price, priceSuffix, features, buttonText, isRecommended, isDark, stripePriceId, campaignLimit } = req.body as {
    title?: string;
    description?: string;
    price?: number;
    priceSuffix?: string;
    features?: string[];
    buttonText?: string;
    isRecommended?: boolean;
    isDark?: boolean;
    stripePriceId?: string;
    campaignLimit?: number;
  };

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) {
    return next(new AppError("Plan not found", 404));
  }

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      description: description ?? existing.description,
      price: price !== undefined ? Number(price) : existing.price,
      priceSuffix: priceSuffix ?? existing.priceSuffix,
      features: features ?? (existing.features as any),
      buttonText: buttonText ?? existing.buttonText,
      isRecommended: isRecommended !== undefined ? !!isRecommended : existing.isRecommended,
      isDark: isDark !== undefined ? !!isDark : existing.isDark,
      stripePriceId: stripePriceId !== undefined ? stripePriceId : existing.stripePriceId,
      campaignLimit: campaignLimit !== undefined ? Number(campaignLimit) : existing.campaignLimit
    } as any
  });

  res.status(200).json({
    status: "success",
    message: "Plan updated successfully",
    data: updated
  });
});

/**
 * DELETE /api/plans/:id — Delete a pricing plan (Admin only)
 */
export const deletePlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) {
    return next(new AppError("Plan not found", 404));
  }

  await prisma.plan.delete({ where: { id } });

  res.status(200).json({
    status: "success",
    message: "Plan deleted successfully"
  });
});

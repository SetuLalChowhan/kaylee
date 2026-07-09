import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { PlanService } from "../services/plan.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/plans — Get all pricing plans sorted by price
 */
export const getPlans = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const plans = await PlanService.getPublicPlans();
  res.status(200).json({
    status: "success",
    data: plans
  });
});

/**
 * POST /api/plans — Create a new pricing plan (Admin only)
 */
export const createPlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body;
  if (!data.title || data.price === undefined || !data.slug) {
    return next(new AppError("Title, Slug, and Price are required", 400));
  }

  const plan = await PlanService.createPlan(data);
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
  const updated = await PlanService.updatePlan(id, req.body);
  res.status(200).json({
    status: "success",
    message: "Plan updated successfully",
    data: updated
  });
});

/**
 * DELETE /api/plans/:id — Deactivate a pricing plan (Admin only)
 */
export const deletePlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  await PlanService.deactivatePlan(id);
  res.status(200).json({
    status: "success",
    message: "Plan deactivated successfully (set to inactive)"
  });
});

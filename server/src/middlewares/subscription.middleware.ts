import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { PlanService } from "../services/plan.service.js";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

/**
 * Dedicated Middleware: Validates subscription eligibility before opening checkout session.
 * 
 * Rules:
 * 1. User must exist and target plan must be active.
 * 2. Active Founding Members cannot purchase Founding Member plans (Monthly or Yearly) again.
 * 3. Users cannot re-purchase the exact same plan they are currently subscribed to.
 * 4. Users who previously claimed & cancelled a Founding plan cannot claim Founding again.
 * 5. Founding slots are capped at 200 total active/claimed slots.
 */
export const validateCheckoutEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const { planId } = req.body as { planId: string };

    if (!planId) {
      return next(new AppError("Plan ID is required", 400));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const targetPlan = await PlanService.getPlanById(planId);
    if (!targetPlan.isActive) {
      return next(new AppError("Selected plan is not currently active", 400));
    }

    const isCurrentFounding = !!(
      user.plan?.isFounding ||
      user.plan?.slug.toLowerCase().includes("founding") ||
      user.plan?.slug.toLowerCase().includes("fonding") ||
      user.plan?.title.toLowerCase().includes("founding") ||
      user.plan?.title.toLowerCase().includes("fonding")
    );

    const isTargetFounding = !!(
      targetPlan.isFounding ||
      targetPlan.slug.toLowerCase().includes("founding") ||
      targetPlan.slug.toLowerCase().includes("fonding") ||
      targetPlan.title.toLowerCase().includes("founding") ||
      targetPlan.title.toLowerCase().includes("fonding")
    );

    // Rule A: Active Founding Members CANNOT purchase Founding Member again
    if (isCurrentFounding && isTargetFounding) {
      return next(
        new AppError("You are already an active Founding Member.", 400)
      );
    }

    // Rule B: Users cannot re-purchase the exact same plan they are currently on
    if (user.planId === targetPlan.id) {
      return next(
        new AppError("You are already subscribed to this plan.", 400)
      );
    }

    // Rule C: Capacity check for Founding Member target plan
    if (isTargetFounding) {
      const claimedCount = await PlanService.getFoundingClaimedCount();
      if (claimedCount >= 200) {
        return next(
          new AppError("Founding Member plan is currently sold out.", 400)
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Enforces user's campaign limit before creating a new UGC campaign
 */
export const requireCampaignLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = (req as AuthRequest).user;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });

    const campaignLimit = user?.plan?.campaignLimit ?? 1;

    const campaignCount = await prisma.ugcCampaign.count({
      where: { userId },
    });

    if (campaignCount >= campaignLimit) {
      return next(
        new AppError(
          `You have reached your active campaign limit of ${campaignLimit}. Please upgrade your plan to create more campaigns.`,
          403
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

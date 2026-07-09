import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
/**
 * GET /api/plans — Get all pricing plans sorted by price
 */
export const getPlans = catchAsync(async (req, res, next) => {
    const plans = await prisma.plan.findMany({
        orderBy: { price: "asc" }
    });
    const plansWithCounts = await Promise.all(plans.map(async (p) => {
        const usersCount = await prisma.user.count({
            where: { planId: p.id },
        });
        return {
            ...p,
            usersCount,
        };
    }));
    res.status(200).json({
        status: "success",
        data: plansWithCounts
    });
});
/**
 * POST /api/plans — Create a new pricing plan (Admin only)
 */
export const createPlan = catchAsync(async (req, res, next) => {
    const { title, description, price, priceSuffix, features, buttonText, isRecommended, isDark, stripePriceId, campaignLimit } = req.body;
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
        }
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
export const updatePlan = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, price, priceSuffix, features, buttonText, isRecommended, isDark, stripePriceId, campaignLimit } = req.body;
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
            features: features ?? existing.features,
            buttonText: buttonText ?? existing.buttonText,
            isRecommended: isRecommended !== undefined ? !!isRecommended : existing.isRecommended,
            isDark: isDark !== undefined ? !!isDark : existing.isDark,
            stripePriceId: stripePriceId !== undefined ? stripePriceId : existing.stripePriceId,
            campaignLimit: campaignLimit !== undefined ? Number(campaignLimit) : existing.campaignLimit
        }
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
export const deletePlan = catchAsync(async (req, res, next) => {
    const { id } = req.params;
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
//# sourceMappingURL=plan.controller.js.map
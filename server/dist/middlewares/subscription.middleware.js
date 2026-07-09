import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
export const requireSubscription = catchAsync(async (req, _res, next) => {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true, plan: true }
    });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    // If no plan, they are on virtual Free plan which is always active
    if (!user.planId || user.plan?.slug === "free") {
        return next();
    }
    // Check subscription record
    if (!user.subscription || user.subscription.status !== "ACTIVE") {
        return next(new AppError("An active subscription is required to perform this action. Please upgrade or renew your plan.", 403));
    }
    next();
});
export const requirePaidPlan = catchAsync(async (req, _res, next) => {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true, plan: true }
    });
    if (!user || !user.planId || user.plan?.slug === "free") {
        return next(new AppError("A paid subscription plan is required to access this feature.", 403));
    }
    if (!user.subscription || user.subscription.status !== "ACTIVE") {
        return next(new AppError("An active subscription is required to perform this action.", 403));
    }
    next();
});
export const requireCampaignLimit = catchAsync(async (req, _res, next) => {
    const { userId, role } = req.user;
    const { targetUserId } = req.body;
    const campaignOwnerId = role === "admin" && targetUserId ? targetUserId : userId;
    const existingCount = await prisma.ugcCampaign.count({
        where: { userId: campaignOwnerId },
    });
    const userWithPlan = await prisma.user.findUnique({
        where: { id: campaignOwnerId },
        include: { plan: true },
    });
    const campaignLimit = userWithPlan?.plan?.campaignLimit ?? 1;
    if (existingCount >= campaignLimit) {
        return next(new AppError(`Plan limit reached. This user can only create up to ${campaignLimit} campaigns. Please upgrade the subscription.`, 403));
    }
    next();
});
//# sourceMappingURL=subscription.middleware.js.map
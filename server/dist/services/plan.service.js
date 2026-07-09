import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
export class PlanService {
    static async getPublicPlans() {
        // 1. Get total claimed slots
        const tracker = await prisma.foundingTracker.findFirst();
        const totalClaimed = tracker ? tracker.totalClaimed : 0;
        // 2. Query active plans
        const plans = await prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { price: "asc" },
        });
        // 3. Filter out founding plan if sold out
        let filteredPlans = plans;
        if (totalClaimed >= 200) {
            filteredPlans = plans.filter((p) => p.slug !== "founding");
        }
        // 4. Map active users counts
        return await Promise.all(filteredPlans.map(async (p) => {
            const usersCount = await prisma.user.count({
                where: { planId: p.id },
            });
            return {
                ...p,
                usersCount,
            };
        }));
    }
    static async getAdminPlans() {
        const plans = await prisma.plan.findMany({
            orderBy: { price: "asc" },
        });
        return await Promise.all(plans.map(async (p) => {
            const usersCount = await prisma.user.count({
                where: { planId: p.id },
            });
            return {
                ...p,
                usersCount,
            };
        }));
    }
    static async getFoundingClaimedCount() {
        const tracker = await prisma.foundingTracker.findFirst();
        return tracker ? tracker.totalClaimed : 0;
    }
    static async getPlanBySlug(slug) {
        const plan = await prisma.plan.findUnique({
            where: { slug },
        });
        if (!plan) {
            throw new AppError(`Plan with slug "${slug}" not found`, 404);
        }
        return plan;
    }
    static async getPlanById(id) {
        const plan = await prisma.plan.findUnique({
            where: { id },
        });
        if (!plan) {
            throw new AppError("Plan not found", 404);
        }
        return plan;
    }
    static async createPlan(data) {
        return await prisma.plan.create({
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description || "",
                price: Number(data.price),
                priceSuffix: data.priceSuffix || "",
                features: data.features || [],
                buttonText: data.buttonText || "Select Plan",
                isRecommended: !!data.isRecommended,
                isDark: !!data.isDark,
                stripePriceId: data.stripePriceId || null,
                campaignLimit: data.campaignLimit !== undefined ? Number(data.campaignLimit) : 2,
                billingCycle: data.billingCycle || "monthly",
                isFounding: !!data.isFounding,
                isActive: data.isActive !== undefined ? !!data.isActive : true,
            },
        });
    }
    static async updatePlan(id, data) {
        const existing = await this.getPlanById(id);
        return await prisma.plan.update({
            where: { id },
            data: {
                title: data.title ?? existing.title,
                slug: data.slug ?? existing.slug,
                description: data.description ?? existing.description,
                price: data.price !== undefined ? Number(data.price) : existing.price,
                priceSuffix: data.priceSuffix ?? existing.priceSuffix,
                features: data.features ?? existing.features,
                buttonText: data.buttonText ?? existing.buttonText,
                isRecommended: data.isRecommended !== undefined ? !!data.isRecommended : existing.isRecommended,
                isDark: data.isDark !== undefined ? !!data.isDark : existing.isDark,
                stripePriceId: data.stripePriceId !== undefined ? data.stripePriceId : existing.stripePriceId,
                campaignLimit: data.campaignLimit !== undefined ? Number(data.campaignLimit) : existing.campaignLimit,
                billingCycle: data.billingCycle ?? existing.billingCycle,
                isFounding: data.isFounding !== undefined ? !!data.isFounding : existing.isFounding,
                isActive: data.isActive !== undefined ? !!data.isActive : existing.isActive,
            },
        });
    }
    static async deactivatePlan(id) {
        await this.getPlanById(id);
        return await prisma.plan.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
//# sourceMappingURL=plan.service.js.map
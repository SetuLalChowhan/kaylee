import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export class PlanService {
  static async getFoundingClaimedCount() {
    const foundingUsersCount = await prisma.user.count({
      where: {
        plan: {
          OR: [
            { isFounding: true },
            { slug: { contains: "founding", mode: "insensitive" } },
            { slug: { contains: "fonding", mode: "insensitive" } },
            { title: { contains: "founding", mode: "insensitive" } },
            { title: { contains: "fonding", mode: "insensitive" } },
          ]
        }
      }
    });

    try {
      const tracker = await prisma.foundingTracker.findFirst();
      if (!tracker) {
        await prisma.foundingTracker.create({
          data: { totalClaimed: foundingUsersCount }
        });
      } else if (tracker.totalClaimed !== foundingUsersCount) {
        await prisma.foundingTracker.update({
          where: { id: tracker.id },
          data: { totalClaimed: foundingUsersCount }
        });
      }
    } catch (err) {
      console.error("Failed to sync FoundingTracker:", err);
    }

    return foundingUsersCount;
  }

  static async getPublicPlans() {
    // 1. Get total claimed slots across all founding plans
    const totalClaimed = await this.getFoundingClaimedCount();

    // 2. Query active plans
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    // 3. Filter out all founding plans if sold out (>= 200)
    let filteredPlans = plans;
    if (totalClaimed >= 200) {
      filteredPlans = plans.filter((p) => !p.isFounding && !p.slug.toLowerCase().includes("founding") && !p.slug.toLowerCase().includes("fonding"));
    }

    // 4. Map active users counts and founding slots status
    return await Promise.all(
      filteredPlans.map(async (p) => {
        const usersCount = await prisma.user.count({
          where: { planId: p.id },
        });
        return {
          ...p,
          usersCount,
          totalFoundingClaimed: totalClaimed,
          foundingSlotsRemaining: Math.max(0, 200 - totalClaimed),
        };
      })
    );
  }

  static async getAdminPlans() {
    const totalClaimed = await this.getFoundingClaimedCount();

    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });

    return await Promise.all(
      plans.map(async (p) => {
        const usersCount = await prisma.user.count({
          where: { planId: p.id },
        });
        return {
          ...p,
          usersCount,
          totalFoundingClaimed: totalClaimed,
          foundingSlotsRemaining: Math.max(0, 200 - totalClaimed),
        };
      })
    );
  }

  static async getPlanBySlug(slug: string) {
    const plan = await prisma.plan.findUnique({
      where: { slug },
    });
    if (!plan) {
      throw new AppError(`Plan with slug "${slug}" not found`, 404);
    }
    return plan;
  }

  static async getPlanById(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new AppError("Plan not found", 404);
    }
    return plan;
  }

  static async createPlan(data: any) {
    let baseSlug = (data.slug && data.slug.trim().length > 0)
      ? data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : (data.title || "plan").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (!baseSlug) baseSlug = "plan";

    let slug = baseSlug;
    let existingPlan = await prisma.plan.findUnique({ where: { slug } });

    if (existingPlan && data.billingCycle && !slug.includes(data.billingCycle)) {
      slug = `${baseSlug}-${data.billingCycle}`;
      existingPlan = await prisma.plan.findUnique({ where: { slug } });
    }

    let count = 1;
    while (existingPlan) {
      slug = `${baseSlug}-${count}`;
      existingPlan = await prisma.plan.findUnique({ where: { slug } });
      count++;
    }

    const titleLower = (data.title || "").toLowerCase();
    const isFounding = data.isFounding !== undefined 
      ? !!data.isFounding 
      : (slug.includes("founding") || slug.includes("fonding") || titleLower.includes("founding") || titleLower.includes("fonding"));

    return await prisma.plan.create({
      data: {
        title: data.title,
        slug,
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
        isFounding,
        isActive: data.isActive !== undefined ? !!data.isActive : true,
      },
    });
  }

  static async updatePlan(id: string, data: any) {
    const existing = await this.getPlanById(id);
    const slug = (data.slug && data.slug.trim().length > 0)
      ? data.slug.trim()
      : existing.slug;

    const titleLower = (data.title || existing.title).toLowerCase();
    const isFounding = data.isFounding !== undefined 
      ? !!data.isFounding 
      : (slug.includes("founding") || slug.includes("fonding") || titleLower.includes("founding") || titleLower.includes("fonding") || existing.isFounding);

    return await prisma.plan.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        slug,
        description: data.description ?? existing.description,
        price: data.price !== undefined ? Number(data.price) : existing.price,
        priceSuffix: data.priceSuffix ?? existing.priceSuffix,
        features: data.features ?? (existing.features as any),
        buttonText: data.buttonText ?? existing.buttonText,
        isRecommended: data.isRecommended !== undefined ? !!data.isRecommended : existing.isRecommended,
        isDark: data.isDark !== undefined ? !!data.isDark : existing.isDark,
        stripePriceId: data.stripePriceId !== undefined ? (data.stripePriceId || null) : existing.stripePriceId,
        campaignLimit: data.campaignLimit !== undefined ? Number(data.campaignLimit) : existing.campaignLimit,
        billingCycle: data.billingCycle ?? existing.billingCycle,
        isFounding,
        isActive: data.isActive !== undefined ? !!data.isActive : existing.isActive,
      },
    });
  }

  static async deactivatePlan(id: string) {
    await this.getPlanById(id);
    return await prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

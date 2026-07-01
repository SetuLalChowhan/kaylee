import prisma from "../config/db.js";
export async function seedPlans() {
    const count = await prisma.plan.count();
    if (count > 0) {
        return;
    }
    // Create starter plan (Free)
    await prisma.plan.create({
        data: {
            title: "STATER",
            description: "Try STAKD risk-free for a short sprint.",
            price: 0,
            priceSuffix: "",
            features: [
                "Up to 2 active campaigns",
                "Limited brand review links",
                "Watermarked content previews",
                "Basic campaign planner"
            ],
            buttonText: "Start Free Trial",
            isRecommended: false,
            isDark: false,
            stripePriceId: null,
            campaignLimit: 2,
        }
    });
    // Create Pro plan
    await prisma.plan.create({
        data: {
            title: "PRO",
            description: "Built for creators working with brands regularly.",
            price: 24,
            priceSuffix: "/ monthly",
            features: [
                "Up to 20 active campaigns",
                "Unlimited brand review links",
                "Full approval & feedback system",
                "No STAKD branding on deliveries"
            ],
            buttonText: "Get Started with Pro",
            isRecommended: true,
            isDark: true,
            stripePriceId: "price_1TkKSgPHVKe1Ld0tzF82xJeA", // Placeholder Stripe Price ID
            campaignLimit: 20,
        }
    });
    // Create Growth plan
    await prisma.plan.create({
        data: {
            title: "GROWTH",
            description: "Scale your creator business and save more.",
            price: 100,
            priceSuffix: "/ yearly",
            features: [
                "Unlimited active campaigns",
                "Unlimited brand review links",
                "Priority support",
                "Best value pricing (save 20%)"
            ],
            buttonText: "Go Yearly & Save",
            isRecommended: false,
            isDark: false,
            stripePriceId: "price_1TkKSgPHVKe1Ld0tQG9xJeB", // Placeholder Stripe Price ID
            campaignLimit: 999999,
        }
    });
    console.log("Plans seeded successfully");
}
//# sourceMappingURL=plan.seed.js.map
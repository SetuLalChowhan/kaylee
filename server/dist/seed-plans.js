import prisma from "./config/db.js";
async function main() {
    console.log("Seeding plans...");
    const count = await prisma.plan.count();
    if (count > 0) {
        console.log("Plans already seeded. Skipping.");
        return;
    }
    // Create starter plan (Free)
    const starter = await prisma.plan.create({
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
    const pro = await prisma.plan.create({
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
    const growth = await prisma.plan.create({
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
    console.log("Seeding complete:", { starter, pro, growth });
}
main()
    .catch((e) => {
    console.error("Error seeding plans:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-plans.js.map
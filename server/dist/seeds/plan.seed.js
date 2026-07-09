import prisma from "../config/db.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16",
});
export async function seedPlans() {
    let foundingPriceId = null;
    let standardPriceId = null;
    if (process.env.STRIPE_SECRET_KEY) {
        try {
            console.log("Stripe Secret Key found. Syncing products/prices...");
            const products = await stripe.products.list({ limit: 100 });
            // 1. Founding Member Product
            let foundingProd = products.data.find((p) => p.name.toLowerCase() === "founding member" || p.name.toLowerCase() === "founding member subscription");
            if (!foundingProd) {
                console.log("Creating Founding Member product on Stripe...");
                foundingProd = await stripe.products.create({
                    name: "Founding Member",
                    description: "Special introductory subscription rate offered to eligible users (first 200 users).",
                });
            }
            const foundingPrices = await stripe.prices.list({
                product: foundingProd.id,
                active: true,
            });
            let foundingPrice = foundingPrices.data.find((p) => p.unit_amount === 1999 && p.currency === "aud" && p.recurring?.interval === "month");
            if (!foundingPrice) {
                console.log("Creating Founding Member price ($19.99 AUD/mo) on Stripe...");
                foundingPrice = await stripe.prices.create({
                    product: foundingProd.id,
                    unit_amount: 1999,
                    currency: "aud",
                    recurring: { interval: "month" },
                });
            }
            foundingPriceId = foundingPrice.id;
            // 2. Standard Product
            let standardProd = products.data.find((p) => p.name.toLowerCase() === "standard" || p.name.toLowerCase() === "standard subscription");
            if (!standardProd) {
                console.log("Creating Standard Subscription product on Stripe...");
                standardProd = await stripe.products.create({
                    name: "Standard",
                    description: "Regular plan for general creators to manage and scale their business.",
                });
            }
            const standardPrices = await stripe.prices.list({
                product: standardProd.id,
                active: true,
            });
            let standardPrice = standardPrices.data.find((p) => p.unit_amount === 2999 && p.currency === "aud" && p.recurring?.interval === "month");
            if (!standardPrice) {
                console.log("Creating Standard Subscription price ($29.99 AUD/mo) on Stripe...");
                standardPrice = await stripe.prices.create({
                    product: standardProd.id,
                    unit_amount: 2999,
                    currency: "aud",
                    recurring: { interval: "month" },
                });
            }
            standardPriceId = standardPrice.id;
            console.log(`Stripe sync complete. Founding: ${foundingPriceId}, Standard: ${standardPriceId}`);
        }
        catch (err) {
            console.error("Stripe sync error during seeding. Using placeholder Price IDs.", err.message);
            foundingPriceId = "price_1TkKSgPHVKe1Ld0tzF82xJeA";
            standardPriceId = "price_1TkKSgPHVKe1Ld0tQG9xJeB";
        }
    }
    else {
        console.warn("No STRIPE_SECRET_KEY found. Using placeholder Price IDs.");
        foundingPriceId = "price_1TkKSgPHVKe1Ld0tzF82xJeA";
        standardPriceId = "price_1TkKSgPHVKe1Ld0tQG9xJeB";
    }
    // Define target plans
    const targetPlans = [
        {
            title: "FREE",
            slug: "free",
            description: "Explore the platform with basic features.",
            price: 0,
            priceSuffix: "",
            features: [
                "1 active campaign limit",
                "Limited brand review links",
                "Watermarked content previews",
                "Basic campaign planner"
            ],
            buttonText: "Start Free Trial",
            isRecommended: false,
            isDark: false,
            stripePriceId: null,
            campaignLimit: 1,
            billingCycle: "free",
            isFounding: false,
            isActive: true,
        },
        {
            title: "FOUNDING MEMBER",
            slug: "founding",
            description: "Special introductory subscription rate for the first 200 users.",
            price: 19.99,
            priceSuffix: "/ monthly",
            features: [
                "Unlimited active campaigns",
                "Unlimited brand review links",
                "Full approval & feedback system",
                "No STAKD branding on deliveries",
                "Priority support"
            ],
            buttonText: "Join as Founding Member",
            isRecommended: true,
            isDark: true,
            stripePriceId: foundingPriceId,
            campaignLimit: 999999,
            billingCycle: "monthly",
            isFounding: true,
            isActive: true,
        },
        {
            title: "STANDARD",
            slug: "standard",
            description: "Regular plan for general creators to manage and scale their business.",
            price: 29.99,
            priceSuffix: "/ monthly",
            features: [
                "Unlimited active campaigns",
                "Unlimited brand review links",
                "Full approval & feedback system",
                "No STAKD branding on deliveries",
                "Priority support"
            ],
            buttonText: "Get Standard Plan",
            isRecommended: false,
            isDark: false,
            stripePriceId: standardPriceId,
            campaignLimit: 999999,
            billingCycle: "monthly",
            isFounding: false,
            isActive: true,
        },
    ];
    // Upsert target plans in database by slug
    for (const planData of targetPlans) {
        const existing = await prisma.plan.findUnique({
            where: { slug: planData.slug }
        });
        if (existing) {
            await prisma.plan.update({
                where: { id: existing.id },
                data: {
                    title: planData.title,
                    description: planData.description,
                    price: planData.price,
                    priceSuffix: planData.priceSuffix,
                    features: planData.features,
                    buttonText: planData.buttonText,
                    isRecommended: planData.isRecommended,
                    isDark: planData.isDark,
                    stripePriceId: planData.stripePriceId,
                    campaignLimit: planData.campaignLimit,
                    billingCycle: planData.billingCycle,
                    isFounding: planData.isFounding,
                    isActive: planData.isActive,
                }
            });
            console.log(`Plan "${planData.title}" updated successfully.`);
        }
        else {
            await prisma.plan.create({
                data: {
                    title: planData.title,
                    slug: planData.slug,
                    description: planData.description,
                    price: planData.price,
                    priceSuffix: planData.priceSuffix,
                    features: planData.features,
                    buttonText: planData.buttonText,
                    isRecommended: planData.isRecommended,
                    isDark: planData.isDark,
                    stripePriceId: planData.stripePriceId,
                    campaignLimit: planData.campaignLimit,
                    billingCycle: planData.billingCycle,
                    isFounding: planData.isFounding,
                    isActive: planData.isActive,
                }
            });
            console.log(`Plan "${planData.title}" created successfully.`);
        }
    }
    // Remove any legacy plans that are not part of targetPlans
    const allPlans = await prisma.plan.findMany();
    const targetSlugs = targetPlans.map(tp => tp.slug);
    const legacyPlans = allPlans.filter(p => !targetSlugs.includes(p.slug));
    for (const lp of legacyPlans) {
        console.log(`Cleaning up legacy plan: ${lp.title}...`);
        await prisma.user.updateMany({
            where: { planId: lp.id },
            data: { planId: null }
        });
        await prisma.purchase.deleteMany({
            where: { planId: lp.id }
        });
        await prisma.plan.delete({
            where: { id: lp.id }
        });
        console.log(`Legacy plan "${lp.title}" removed.`);
    }
    // Initialize FoundingTracker if empty
    const tracker = await prisma.foundingTracker.findFirst();
    if (!tracker) {
        await prisma.foundingTracker.create({
            data: { totalClaimed: 0 }
        });
        console.log("Initialized FoundingTracker with 0 claimed slots.");
    }
    console.log("Database plans synchronization complete.");
}
//# sourceMappingURL=plan.seed.js.map
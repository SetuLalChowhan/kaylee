import Stripe from "stripe";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16",
});
/**
 * POST /api/subscriptions/checkout — Initiate payment/subscription flow
 */
export const createCheckoutSession = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { planId } = req.body;
    if (!planId) {
        return next(new AppError("Plan ID is required", 400));
    }
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
        return next(new AppError("Plan not found", 404));
    }
    if (plan.title.toUpperCase() === "FOUNDING MEMBER") {
        // 1. Check if user already had a Founding Member subscription in the past
        const previousFoundingPurchase = await prisma.purchase.findFirst({
            where: {
                userId,
                plan: {
                    title: {
                        equals: "FOUNDING MEMBER",
                        mode: "insensitive"
                    }
                }
            }
        });
        if (previousFoundingPurchase) {
            return next(new AppError("You are not eligible for Founding Member pricing because you have previously cancelled or had a Founding Member subscription. Please subscribe to the Standard plan.", 400));
        }
        // 2. Check the 200 member limit
        const foundingMemberCount = await prisma.user.count({
            where: {
                plan: {
                    title: {
                        equals: "FOUNDING MEMBER",
                        mode: "insensitive"
                    }
                }
            }
        });
        if (foundingMemberCount >= 200) {
            return next(new AppError("Founding Member plan is no longer available. The limit of 200 members has been reached.", 400));
        }
    }
    // 1. If it's a Free Plan, upgrade user instantly without Stripe
    if (plan.price === 0 || !plan.stripePriceId) {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { planId: plan.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                plan: true
            }
        });
        return res.status(200).json({
            status: "success",
            message: "Upgraded to free plan successfully",
            url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard/settings?tab=Subscription`,
            data: updatedUser
        });
    }
    // 2. Paid Plan: Create Stripe Checkout Session
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const customerEmail = user?.email;
        const sessionData = {
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: plan.stripePriceId,
                    quantity: 1,
                },
            ],
            success_url: `${clientUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/subscription/cancel`,
            metadata: {
                userId,
                planId: plan.id,
            },
        };
        if (customerEmail) {
            sessionData.customer_email = customerEmail;
        }
        const session = await stripe.checkout.sessions.create(sessionData);
        res.status(200).json({
            status: "success",
            url: session.url,
        });
    }
    catch (error) {
        return next(new AppError(`Stripe checkout failed: ${error.message}`, 500));
    }
});
/**
 * POST /api/subscriptions/verify — Verify checkout success on client landing
 */
export const verifySession = catchAsync(async (req, res, next) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return next(new AppError("Session ID is required", 400));
    }
    try {
        // 1. Retrieve Stripe Session
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session || (session.payment_status !== "paid" && session.status !== "complete")) {
            return next(new AppError("Payment not completed or session invalid", 400));
        }
        const { userId, planId } = session.metadata || {};
        if (!userId || !planId) {
            return next(new AppError("Invalid session metadata", 400));
        }
        // 2. Check if purchase is already processed to prevent duplicate records
        const existingPurchase = await prisma.purchase.findUnique({
            where: { stripeSessionId: sessionId },
        });
        let updatedUser;
        if (!existingPurchase) {
            // 3. Record dynamic Purchase log
            const amount = (session.amount_total ? session.amount_total / 100 : 0);
            await prisma.$transaction([
                prisma.purchase.create({
                    data: {
                        userId,
                        planId,
                        amount,
                        stripeSessionId: sessionId,
                        status: "completed",
                    },
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: {
                        planId,
                        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
                        stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
                    },
                }),
            ]);
        }
        updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                plan: true,
            },
        });
        res.status(200).json({
            status: "success",
            message: "Subscription verified successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        return next(new AppError(`Verification failed: ${error.message}`, 500));
    }
});
/**
 * GET /api/subscriptions/my-plan — Fetch current user plan features and campaign counts
 */
export const getMyPlan = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
    });
    const campaignCount = await prisma.ugcCampaign.count({
        where: { userId },
    });
    // Default fallback if no plan associated in DB
    const defaultPlan = {
        title: "FREE",
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
        campaignLimit: 1,
    };
    res.status(200).json({
        status: "success",
        data: {
            plan: user?.plan || defaultPlan,
            campaignCount,
            campaignLimit: user?.plan?.campaignLimit ?? 1,
        },
    });
});
/**
 * POST /api/subscriptions/webhook — Stripe Webhook receiver (production-ready)
 */
export const handleWebhook = catchAsync(async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    if (!sig || !endpointSecret) {
        return next(new AppError("Missing signature or webhook secret configuration", 400));
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return next(new AppError(`Webhook signature verification failed: ${err.message}`, 400));
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { userId, planId } = session.metadata || {};
        if (userId && planId) {
            try {
                const existingPurchase = await prisma.purchase.findUnique({
                    where: { stripeSessionId: session.id },
                });
                if (!existingPurchase) {
                    const amount = (session.amount_total ? session.amount_total / 100 : 0);
                    await prisma.$transaction([
                        prisma.purchase.create({
                            data: {
                                userId,
                                planId,
                                amount,
                                stripeSessionId: session.id,
                                status: "completed",
                            },
                        }),
                        prisma.user.update({
                            where: { id: userId },
                            data: {
                                planId,
                                stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
                                stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
                            },
                        }),
                    ]);
                    console.log(`[Webhook] Successfully processed subscription upgrade for User ${userId}`);
                }
            }
            catch (err) {
                console.error("[Webhook Error] Transaction update failed:", err.message);
                return next(new AppError(`Webhook database update failed: ${err.message}`, 500));
            }
        }
    }
    // Handle subscription cancelled/deleted event from Stripe at period end
    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
        });
        if (user) {
            try {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        planId: null,
                        stripeSubscriptionId: null,
                    },
                });
                if (user.planId) {
                    const latestPurchase = await prisma.purchase.findFirst({
                        where: {
                            userId: user.id,
                            planId: user.planId,
                            status: "completed",
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    });
                    if (latestPurchase) {
                        await prisma.purchase.update({
                            where: { id: latestPurchase.id },
                            data: { status: "cancelled" },
                        });
                    }
                }
                console.log(`[Webhook] Successfully completed period-end cancellation for User ${user.id}`);
            }
            catch (err) {
                console.error("[Webhook Error] customer.subscription.deleted DB update failed:", err.message);
            }
        }
    }
    res.status(200).json({ received: true });
});
/**
 * POST /api/subscriptions/cancel — Cancel user's subscription (at period end)
 */
export const cancelSubscription = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    if (user.stripeSubscriptionId) {
        try {
            // Set cancel_at_period_end to true on Stripe so they retain access until period ends
            await stripe.subscriptions.update(user.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });
        }
        catch (err) {
            console.error("[Cancel Error] Failed to update subscription on Stripe:", err.message);
            return next(new AppError(`Stripe cancellation failed: ${err.message}`, 400));
        }
    }
    // Mark latest completed purchase status as cancelled
    if (user.planId) {
        const latestPurchase = await prisma.purchase.findFirst({
            where: {
                userId,
                planId: user.planId,
                status: "completed",
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        if (latestPurchase) {
            await prisma.purchase.update({
                where: { id: latestPurchase.id },
                data: { status: "cancelled" },
            });
        }
    }
    // Get user with current plan details (retained until period end webhook)
    const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            plan: true,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Subscription cancellation scheduled successfully at the end of the current billing cycle",
        data: updatedUser,
    });
});
/**
 * GET /api/subscriptions/my-payments — Fetch authenticated user's payment history
 */
export const getMyPayments = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const payments = await prisma.purchase.findMany({
        where: { userId },
        include: {
            plan: {
                select: {
                    title: true,
                    price: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    res.status(200).json({
        status: "success",
        data: payments,
    });
});
/**
 * GET /api/subscriptions/admin/payments — Fetch all payments with aggregates (Admin only)
 */
export const adminGetPayments = catchAsync(async (req, res, next) => {
    // Fetch all payment transactions
    const payments = await prisma.purchase.findMany({
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            plan: {
                select: {
                    title: true,
                    price: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    // Calculate aggregates per plan
    const plans = await prisma.plan.findMany({
        include: {
            purchases: {
                where: {
                    status: "completed",
                },
            },
        },
    });
    const aggregates = plans.map((p) => ({
        planId: p.id,
        title: p.title,
        price: p.price,
        totalEarnings: p.purchases.reduce((sum, pr) => sum + pr.amount, 0),
        totalSales: p.purchases.length,
    }));
    res.status(200).json({
        status: "success",
        data: {
            payments,
            aggregates,
        },
    });
});
/**
 * POST /api/subscriptions/admin/cancel — Admin cancels a user's purchase/subscription (Admin only)
 */
export const adminCancelPurchase = catchAsync(async (req, res, next) => {
    const { purchaseId } = req.body;
    if (!purchaseId) {
        return next(new AppError("Purchase ID is required", 400));
    }
    const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { user: true },
    });
    if (!purchase) {
        return next(new AppError("Purchase record not found", 404));
    }
    // Cancel Stripe subscription if active
    if (purchase.user.stripeSubscriptionId) {
        try {
            await stripe.subscriptions.cancel(purchase.user.stripeSubscriptionId);
        }
        catch (err) {
            console.error("[Admin Cancel Error] Failed to cancel subscription on Stripe:", err.message);
        }
    }
    // Reset user's plan if they are currently on the plan corresponding to the purchase
    if (purchase.user.planId === purchase.planId) {
        await prisma.user.update({
            where: { id: purchase.userId },
            data: {
                planId: null,
                stripeSubscriptionId: null,
            },
        });
    }
    // Update purchase record status
    const updatedPurchase = await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
            status: "cancelled",
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            plan: {
                select: {
                    title: true,
                    price: true,
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        message: "Purchase and subscription cancelled successfully",
        data: updatedPurchase,
    });
});
//# sourceMappingURL=subscription.controller.js.map
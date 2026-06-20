import type { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

/**
 * POST /api/subscriptions/checkout — Initiate payment/subscription flow
 */
export const createCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { planId } = req.body as { planId: string };

  if (!planId) {
    return next(new AppError("Plan ID is required", 400));
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return next(new AppError("Plan not found", 404));
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
    const session = await stripe.checkout.sessions.create({
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
    });

    res.status(200).json({
      status: "success",
      url: session.url,
    });
  } catch (error: any) {
    return next(new AppError(`Stripe checkout failed: ${error.message}`, 500));
  }
});

/**
 * POST /api/subscriptions/verify — Verify checkout success on client landing
 */
export const verifySession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { sessionId } = req.body as { sessionId: string };

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
  } catch (error: any) {
    return next(new AppError(`Verification failed: ${error.message}`, 500));
  }
});

/**
 * GET /api/subscriptions/my-plan — Fetch current user plan features and campaign counts
 */
export const getMyPlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { plan: true },
  });

  const campaignCount = await prisma.ugcCampaign.count({
    where: { userId },
  });

  // Default fallback if no plan associated in DB
  const defaultPlan = {
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
    campaignLimit: 2,
  };

  res.status(200).json({
    status: "success",
    data: {
      plan: user?.plan || defaultPlan,
      campaignCount,
      campaignLimit: user?.plan?.campaignLimit ?? 2,
    },
  });
});

/**
 * POST /api/subscriptions/webhook — Stripe Webhook receiver (production-ready)
 */
export const handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!sig || !endpointSecret) {
    return next(new AppError("Missing signature or webhook secret configuration", 400));
  }

  let event: Stripe.Event;

  try {
    // req.body must be the raw Buffer of the request body
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return next(new AppError(`Webhook signature verification failed: ${err.message}`, 400));
  }

  // Process completed checkout session event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
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
      } catch (err: any) {
        console.error("[Webhook Error] Transaction update failed:", err.message);
        return next(new AppError(`Webhook database update failed: ${err.message}`, 500));
      }
    }
  }

  res.status(200).json({ received: true });
});

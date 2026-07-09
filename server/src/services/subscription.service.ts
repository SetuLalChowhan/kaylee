import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { StripeService } from "./stripe.service.js";
import { PlanService } from "./plan.service.js";

export class SubscriptionService {
  static async getUserSubscription(userId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!sub) {
      // Return a virtual Starter/Free subscription representation
      const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
      return {
        id: "virtual-free",
        userId,
        planId: freePlan?.id || null,
        plan: freePlan,
        status: "ACTIVE",
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        expiresAt: null,
      };
    }

    return sub;
  }

  static async createCheckoutSession(userId: string, planId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const plan = await PlanService.getPlanById(planId);
    if (!plan.isActive) throw new AppError("Selected plan is not currently active", 400);

    // 1. Free plan logic: upgrade instantly
    if (plan.price === 0 || !plan.stripePriceId || plan.slug === "free") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { planId: plan.id, stripeSubscriptionId: null },
        }),
        prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId: plan.id,
            stripeSubscriptionId: null,
            stripeCustomerId: user.stripeCustomerId,
            status: "ACTIVE",
          },
          update: {
            planId: plan.id,
            stripeSubscriptionId: null,
            status: "ACTIVE",
            expiresAt: null,
            cancelAtPeriodEnd: false,
            cancelledAt: null,
          },
        }),
      ]);

      return {
        status: "success",
        url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard/settings?tab=Subscription`,
      };
    }

    // 2. Founding Member plan logic: validate limits & historical cancellations
    if (plan.slug === "founding") {
      const claimedCount = await PlanService.getFoundingClaimedCount();
      if (claimedCount >= 200) {
        throw new AppError("Founding Member plan has been sold out.", 400);
      }

      // Check if they ever cancelled or had a founding subscription in completed purchases
      const priorFoundingPurchase = await prisma.purchase.findFirst({
        where: {
          userId,
          status: "completed",
          plan: { slug: "founding" },
        },
      });

      if (priorFoundingPurchase) {
        throw new AppError(
          "You are not eligible for Founding Member pricing because you have previously cancelled or had a Founding Member subscription. Please subscribe to the Standard plan.",
          400
        );
      }
    }

    // 3. Create Stripe Checkout Session
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const sessionParams: any = {
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

    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await StripeService.createCheckoutSession(sessionParams);
    return {
      status: "success",
      url: session.url,
    };
  }

  static async verifyCheckoutSession(sessionId: string) {
    const session = await StripeService.retrieveSession(sessionId);
    if (!session || (session.payment_status !== "paid" && session.status !== "complete")) {
      throw new AppError("Payment not completed or session invalid", 400);
    }

    const { userId, planId } = session.metadata || {};
    if (!userId || !planId) {
      throw new AppError("Invalid checkout session metadata", 400);
    }

    // Get current period from stripe subscription if available
    let currentPeriodStart: Date | null = null;
    let currentPeriodEnd: Date | null = null;
    const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : null;

    if (stripeSubscriptionId) {
      const stripeSub = await StripeService.retrieveSubscription(stripeSubscriptionId) as any;
      currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
      currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
    }

    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const currency = session.currency || "aud";
    const stripeCustomerId = typeof session.customer === "string" ? session.customer : "";

    await this.processSuccessfulPayment({
      userId,
      planId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSessionId: sessionId,
      amount,
      currency,
      invoiceId: typeof session.invoice === "string" ? session.invoice : null,
      currentPeriodStart,
      currentPeriodEnd,
    });

    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        plan: true,
      },
    });
  }

  static async cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || !user.stripeSubscriptionId) {
      throw new AppError("No active Stripe subscription found to cancel", 400);
    }

    // Cancel Stripe subscription
    await StripeService.cancelSubscription(user.stripeSubscriptionId);

    // Update Subscription status to CANCELLED in database
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: "CANCELLED",
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    });

    return { message: "Your subscription cancellation has been scheduled successfully." };
  }

  static async renewSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || !user.stripeSubscriptionId || !user.subscription) {
      throw new AppError("No cancelled subscription found to renew", 400);
    }

    // If subscription is not scheduled to cancel, it's already active
    if (!user.subscription.cancelAtPeriodEnd) {
      return { message: "Subscription is already active" };
    }

    // To renew (reactivate) in Stripe, we update the subscription to reset cancel_at_period_end to false
    const stripe = (StripeService as any).stripe || new (require("stripe"))(process.env.STRIPE_SECRET_KEY || "");
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await prisma.subscription.update({
      where: { userId },
      data: {
        status: "ACTIVE",
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });

    return { message: "Subscription successfully renewed" };
  }

  static async downgradeToFree(userId: string) {
    const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
    const freePlanId = freePlan ? freePlan.id : null;

    return await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          planId: freePlanId,
          stripeSubscriptionId: null,
        },
      });

      await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planId: freePlanId,
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          status: "EXPIRED",
          expiresAt: null,
        },
        update: {
          planId: freePlanId,
          stripeSubscriptionId: null,
          status: "EXPIRED",
          expiresAt: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
        },
      });
    });
  }

  static async processSuccessfulPayment(details: {
    userId: string;
    planId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string | null;
    stripeSessionId: string;
    amount: number;
    currency: string;
    invoiceId: string | null;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Prevent duplicate purchase
      const existing = await tx.purchase.findUnique({
        where: { stripeSessionId: details.stripeSessionId },
      });
      if (existing) return;

      const plan = await tx.plan.findUnique({ where: { id: details.planId } });
      if (!plan) throw new Error("Plan not found");

      // 2. Create Purchase history record
      await tx.purchase.create({
        data: {
          userId: details.userId,
          planId: details.planId,
          amount: details.amount,
          currency: details.currency,
          invoiceId: details.invoiceId,
          stripeSessionId: details.stripeSessionId,
          status: "completed",
        },
      });

      // 3. Upsert Subscription
      const expiresAt = details.currentPeriodEnd;
      await tx.subscription.upsert({
        where: { userId: details.userId },
        create: {
          userId: details.userId,
          planId: details.planId,
          stripeSubscriptionId: details.stripeSubscriptionId,
          stripeCustomerId: details.stripeCustomerId,
          status: "ACTIVE",
          currentPeriodStart: details.currentPeriodStart,
          currentPeriodEnd: details.currentPeriodEnd,
          expiresAt,
        },
        update: {
          planId: details.planId,
          stripeSubscriptionId: details.stripeSubscriptionId,
          stripeCustomerId: details.stripeCustomerId,
          status: "ACTIVE",
          currentPeriodStart: details.currentPeriodStart,
          currentPeriodEnd: details.currentPeriodEnd,
          expiresAt,
          cancelledAt: null,
          cancelAtPeriodEnd: false,
        },
      });

      // 4. Update User reference
      await tx.user.update({
        where: { id: details.userId },
        data: {
          planId: details.planId,
          stripeCustomerId: details.stripeCustomerId,
          stripeSubscriptionId: details.stripeSubscriptionId,
        },
      });

      // 5. Founding tracker increment if first time purchase
      if (plan.slug === "founding") {
        const priorCount = await tx.purchase.count({
          where: {
            userId: details.userId,
            planId: details.planId,
            status: "completed",
            stripeSessionId: { not: details.stripeSessionId },
          },
        });

        if (priorCount === 0) {
          const tracker = await tx.foundingTracker.findFirst();
          if (tracker) {
            await tx.foundingTracker.update({
              where: { id: tracker.id },
              data: { totalClaimed: { increment: 1 } },
            });
          }
        }
      }
    });
  }
}

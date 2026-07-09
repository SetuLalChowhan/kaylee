import prisma from "../config/db.js";
import Stripe from "stripe";
import { SubscriptionService } from "./subscription.service.js";
import { StripeService } from "./stripe.service.js";
export class WebhookService {
    static async handleCheckoutSessionCompleted(session) {
        const sess = session;
        const { userId, planId } = sess.metadata || {};
        if (!userId || !planId) {
            console.warn("[Webhook warning] checkout.session.completed received without userId/planId in metadata");
            return;
        }
        if (sess.payment_status === "paid") {
            let currentPeriodStart = null;
            let currentPeriodEnd = null;
            const stripeSubscriptionId = typeof sess.subscription === "string" ? sess.subscription : null;
            if (stripeSubscriptionId) {
                const stripeSub = await StripeService.retrieveSubscription(stripeSubscriptionId);
                currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
                currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
            }
            const amount = sess.amount_total ? sess.amount_total / 100 : 0;
            const currency = sess.currency || "aud";
            const stripeCustomerId = typeof sess.customer === "string" ? sess.customer : "";
            await SubscriptionService.processSuccessfulPayment({
                userId,
                planId,
                stripeCustomerId,
                stripeSubscriptionId,
                stripeSessionId: sess.id,
                amount,
                currency,
                invoiceId: typeof sess.invoice === "string" ? sess.invoice : null,
                currentPeriodStart,
                currentPeriodEnd,
            });
            console.log(`[Webhook success] checkout.session.completed processed for user ${userId}`);
        }
    }
    static async handleInvoicePaid(invoice) {
        const inv = invoice;
        const stripeSubscriptionId = typeof inv.subscription === "string" ? inv.subscription : null;
        if (!stripeSubscriptionId)
            return;
        // Find the user with this subscription ID
        const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId },
        });
        if (!user) {
            console.warn(`[Webhook warning] invoice.paid: no user found with stripeSubscriptionId ${stripeSubscriptionId}`);
            return;
        }
        const stripeSub = await StripeService.retrieveSubscription(stripeSubscriptionId);
        const currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
        const currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
        const amount = inv.amount_paid ? inv.amount_paid / 100 : 0;
        const currency = inv.currency || "aud";
        const planId = user.planId;
        if (!planId)
            return;
        await SubscriptionService.processSuccessfulPayment({
            userId: user.id,
            planId,
            stripeCustomerId: typeof inv.customer === "string" ? inv.customer : "",
            stripeSubscriptionId,
            stripeSessionId: inv.charge ? String(inv.charge) : `inv_${inv.id}`,
            amount,
            currency,
            invoiceId: inv.id,
            currentPeriodStart,
            currentPeriodEnd,
        });
        console.log(`[Webhook success] invoice.paid processed for user ${user.id}`);
    }
    static async handleInvoicePaymentFailed(invoice) {
        const inv = invoice;
        const stripeSubscriptionId = typeof inv.subscription === "string" ? inv.subscription : null;
        if (!stripeSubscriptionId)
            return;
        const sub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId },
        });
        if (!sub) {
            console.warn(`[Webhook warning] invoice.payment_failed: no subscription record for ${stripeSubscriptionId}`);
            return;
        }
        // Payment Failed -> PAST_DUE -> expiresAt = now + 5 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 5);
        await prisma.subscription.update({
            where: { id: sub.id },
            data: {
                status: "PAST_DUE",
                expiresAt,
            },
        });
        console.log(`[Webhook success] invoice.payment_failed updated sub ${sub.id} to PAST_DUE with 5-day grace period`);
    }
    static async handleSubscriptionUpdated(stripeSub) {
        const subObj = stripeSub;
        const sub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subObj.id },
        });
        if (!sub)
            return;
        const status = subObj.status.toUpperCase() === "ACTIVE" ? "ACTIVE" : subObj.status.toUpperCase() === "PAST_DUE" ? "PAST_DUE" : "CANCELLED";
        const currentPeriodStart = new Date(subObj.current_period_start * 1000);
        const currentPeriodEnd = new Date(subObj.current_period_end * 1000);
        await prisma.subscription.update({
            where: { id: sub.id },
            data: {
                status,
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd: subObj.cancel_at_period_end,
                cancelledAt: subObj.canceled_at ? new Date(subObj.canceled_at * 1000) : null,
                expiresAt: new Date(subObj.current_period_end * 1000),
            },
        });
        console.log(`[Webhook success] customer.subscription.updated processed for sub ${subObj.id}`);
    }
    static async handleSubscriptionDeleted(stripeSub) {
        const subObj = stripeSub;
        const sub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subObj.id },
        });
        if (!sub)
            return;
        // Downgrade user to Free
        await SubscriptionService.downgradeToFree(sub.userId);
        console.log(`[Webhook success] customer.subscription.deleted downgraded user ${sub.userId} to free`);
    }
}
//# sourceMappingURL=webhook.service.js.map
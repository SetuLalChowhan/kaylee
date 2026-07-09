import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { SubscriptionService } from "../services/subscription.service.js";
import { PaymentService } from "../services/payment.service.js";
import { StripeService } from "../services/stripe.service.js";
import { WebhookService } from "../services/webhook.service.js";
import Stripe from "stripe";
/**
 * POST /api/subscriptions/checkout — Create a new subscription/checkout session
 */
export const createCheckoutSession = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { planId } = req.body;
    if (!planId) {
        return next(new AppError("Plan ID is required", 400));
    }
    const result = await SubscriptionService.createCheckoutSession(userId, planId);
    res.status(200).json(result);
});
/**
 * POST /api/subscriptions/verify — Verify checkout success on client landing
 */
export const verifySession = catchAsync(async (req, res, next) => {
    const { sessionId } = req.body;
    if (!sessionId) {
        return next(new AppError("Session ID is required", 400));
    }
    const user = await SubscriptionService.verifyCheckoutSession(sessionId);
    res.status(200).json({
        status: "success",
        message: "Subscription verified successfully",
        data: user,
    });
});
/**
 * GET /api/subscriptions/my-plan — Fetch current user plan features and campaign counts
 */
export const getMyPlan = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const subscription = await SubscriptionService.getUserSubscription(userId);
    const campaignCount = await prisma.ugcCampaign.count({
        where: { userId },
    });
    res.status(200).json({
        status: "success",
        data: {
            plan: subscription.plan,
            campaignCount,
            campaignLimit: subscription.plan?.campaignLimit ?? 1,
        },
    });
});
/**
 * POST /api/subscriptions/cancel — Cancel user's subscription (at period end)
 */
export const cancelSubscription = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const result = await SubscriptionService.cancelSubscription(userId);
    res.status(200).json({
        status: "success",
        ...result,
    });
});
/**
 * GET /api/subscriptions/my-payments — Fetch creator's payment history
 */
export const getMyPayments = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const payments = await PaymentService.getMyPayments(userId);
    res.status(200).json({
        status: "success",
        data: payments,
    });
});
/**
 * GET /api/subscriptions/purchase/:purchaseId/invoice — Fetch Stripe invoice PDF URL
 */
export const downloadPurchaseInvoice = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const { purchaseId } = req.params;
    const isAdmin = role === "admin";
    const pdfUrl = await PaymentService.retrieveStripeInvoice(purchaseId, userId, isAdmin);
    res.status(200).json({
        status: "success",
        url: pdfUrl,
    });
});
/**
 * GET /api/subscriptions/admin/payments — Admin fetches all payments and aggregates (Admin only)
 */
export const adminGetPayments = catchAsync(async (req, res, next) => {
    const result = await PaymentService.adminGetPayments();
    res.status(200).json({
        status: "success",
        data: result,
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
    if (purchase.user.stripeSubscriptionId) {
        try {
            await StripeService.cancelSubscription(purchase.user.stripeSubscriptionId);
        }
        catch (err) {
            console.error("[Admin Cancel Error] Failed to cancel subscription on Stripe:", err.message);
        }
    }
    await SubscriptionService.downgradeToFree(purchase.userId);
    // Update purchase status
    const updatedPurchase = await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: "cancelled" },
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
/**
 * POST /api/subscriptions/webhook — Stripe Webhook receiver
 */
export const handleWebhook = catchAsync(async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    if (!sig || !endpointSecret) {
        return next(new AppError("Missing signature or webhook secret configuration", 400));
    }
    let event;
    try {
        event = StripeService.verifyWebhookEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return next(new AppError(`Webhook signature verification failed: ${err.message}`, 400));
    }
    try {
        switch (event.type) {
            case "checkout.session.completed":
                await WebhookService.handleCheckoutSessionCompleted(event.data.object);
                break;
            case "invoice.paid":
                await WebhookService.handleInvoicePaid(event.data.object);
                break;
            case "invoice.payment_failed":
                await WebhookService.handleInvoicePaymentFailed(event.data.object);
                break;
            case "customer.subscription.updated":
                await WebhookService.handleSubscriptionUpdated(event.data.object);
                break;
            case "customer.subscription.deleted":
                await WebhookService.handleSubscriptionDeleted(event.data.object);
                break;
            default:
                console.log(`[Webhook info] Unhandled stripe event type: ${event.type}`);
        }
    }
    catch (err) {
        console.error(`[Webhook error] Processing failed for event ${event.type}:`, err.message);
        return next(new AppError(`Webhook processing failed: ${err.message}`, 500));
    }
    res.status(200).json({ received: true });
});
//# sourceMappingURL=subscription.controller.js.map
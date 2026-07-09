import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2023-10-16",
});
export class StripeService {
    static async createCheckoutSession(params) {
        return await stripe.checkout.sessions.create(params);
    }
    static async retrieveSession(sessionId) {
        return await stripe.checkout.sessions.retrieve(sessionId);
    }
    static async retrieveSubscription(subscriptionId) {
        return await stripe.subscriptions.retrieve(subscriptionId);
    }
    static async cancelSubscription(subscriptionId) {
        return await stripe.subscriptions.cancel(subscriptionId);
    }
    static async retrieveInvoice(invoiceId) {
        return await stripe.invoices.retrieve(invoiceId);
    }
    static verifyWebhookEvent(payload, signature, secret) {
        return stripe.webhooks.constructEvent(payload, signature, secret);
    }
}
//# sourceMappingURL=stripe.service.js.map
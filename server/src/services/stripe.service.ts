import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export class StripeService {
  static async createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
    return await stripe.checkout.sessions.create(params);
  }

  static async retrieveSession(sessionId: string) {
    return await stripe.checkout.sessions.retrieve(sessionId);
  }

  static async retrieveSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  static async cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  static async retrieveInvoice(invoiceId: string) {
    return await stripe.invoices.retrieve(invoiceId);
  }

  static verifyWebhookEvent(payload: string | Buffer, signature: string, secret: string) {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }
}

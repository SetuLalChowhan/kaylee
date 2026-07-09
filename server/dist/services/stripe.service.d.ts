import Stripe from "stripe";
export declare class StripeService {
    static createCheckoutSession(params: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    static retrieveSession(sessionId: string): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    static retrieveSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>>;
    static cancelSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>>;
    static retrieveInvoice(invoiceId: string): Promise<Stripe.Response<Stripe.Invoice>>;
    static verifyWebhookEvent(payload: string | Buffer, signature: string, secret: string): Stripe.Event;
}
//# sourceMappingURL=stripe.service.d.ts.map
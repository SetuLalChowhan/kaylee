import Stripe from "stripe";
export declare class WebhookService {
    static handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void>;
    static handleInvoicePaid(invoice: Stripe.Invoice): Promise<void>;
    static handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void>;
    static handleSubscriptionUpdated(stripeSub: Stripe.Subscription): Promise<void>;
    static handleSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void>;
}
//# sourceMappingURL=webhook.service.d.ts.map
export declare class SubscriptionService {
    static getUserSubscription(userId: string): Promise<({
        plan: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            title: string;
            description: string;
            price: number;
            priceSuffix: string;
            features: import("@prisma/client/runtime/client").JsonValue;
            buttonText: string;
            isRecommended: boolean;
            isDark: boolean;
            stripePriceId: string | null;
            campaignLimit: number;
            billingCycle: string;
            isFounding: boolean;
            isActive: boolean;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string | null;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        userId: string;
        status: string;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
        cancelledAt: Date | null;
        expiresAt: Date | null;
    }) | {
        id: string;
        userId: string;
        planId: string | null;
        plan: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            title: string;
            description: string;
            price: number;
            priceSuffix: string;
            features: import("@prisma/client/runtime/client").JsonValue;
            buttonText: string;
            isRecommended: boolean;
            isDark: boolean;
            stripePriceId: string | null;
            campaignLimit: number;
            billingCycle: string;
            isFounding: boolean;
            isActive: boolean;
        } | null;
        status: string;
        currentPeriodStart: null;
        currentPeriodEnd: null;
        cancelAtPeriodEnd: boolean;
        expiresAt: null;
    }>;
    static createCheckoutSession(userId: string, planId: string): Promise<{
        status: string;
        url: string | null;
    }>;
    static verifyCheckoutSession(sessionId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        plan: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            title: string;
            description: string;
            price: number;
            priceSuffix: string;
            features: import("@prisma/client/runtime/client").JsonValue;
            buttonText: string;
            isRecommended: boolean;
            isDark: boolean;
            stripePriceId: string | null;
            campaignLimit: number;
            billingCycle: string;
            isFounding: boolean;
            isActive: boolean;
        } | null;
    } | null>;
    static cancelSubscription(userId: string): Promise<{
        message: string;
    }>;
    static renewSubscription(userId: string): Promise<{
        message: string;
    }>;
    static downgradeToFree(userId: string): Promise<void>;
    static processSuccessfulPayment(details: {
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
    }): Promise<void>;
}
//# sourceMappingURL=subscription.service.d.ts.map
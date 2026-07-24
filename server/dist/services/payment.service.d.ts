export declare class PaymentService {
    static getMyPayments(userId: string): Promise<({
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        userId: string;
        amount: number;
        status: string;
        stripeSessionId: string;
        currency: string;
        invoiceId: string | null;
    })[]>;
    static adminGetPayments(): Promise<{
        payments: ({
            user: {
                firstName: string;
                lastName: string;
                email: string;
            };
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            planId: string;
            userId: string;
            amount: number;
            status: string;
            stripeSessionId: string;
            currency: string;
            invoiceId: string | null;
        })[];
        aggregates: {
            planId: string;
            title: string;
            price: number;
            totalSales: number;
            totalEarnings: number;
        }[];
    }>;
    static retrieveStripeInvoice(purchaseId: string, userId: string, isAdmin: boolean): Promise<string>;
}
//# sourceMappingURL=payment.service.d.ts.map
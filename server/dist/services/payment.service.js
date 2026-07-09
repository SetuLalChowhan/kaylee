import prisma from "../config/db.js";
import { StripeService } from "./stripe.service.js";
import { AppError } from "../utils/AppError.js";
export class PaymentService {
    static async getMyPayments(userId) {
        return await prisma.purchase.findMany({
            where: { userId },
            include: { plan: true },
            orderBy: { createdAt: "desc" },
        });
    }
    static async adminGetPayments() {
        const payments = await prisma.purchase.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                plan: true,
            },
            orderBy: { createdAt: "desc" },
        });
        const plans = await prisma.plan.findMany();
        const aggregates = await Promise.all(plans.map(async (plan) => {
            const sales = await prisma.purchase.findMany({
                where: { planId: plan.id, status: "completed" },
            });
            const totalEarnings = sales.reduce((acc, curr) => acc + curr.amount, 0);
            return {
                planId: plan.id,
                title: plan.title,
                price: plan.price,
                totalSales: sales.length,
                totalEarnings,
            };
        }));
        return {
            payments,
            aggregates,
        };
    }
    static async retrieveStripeInvoice(purchaseId, userId, isAdmin) {
        const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
        });
        if (!purchase) {
            throw new AppError("Purchase record not found", 404);
        }
        if (purchase.userId !== userId && !isAdmin) {
            throw new AppError("You are not authorized to view this invoice", 403);
        }
        if (!purchase.stripeSessionId) {
            throw new AppError("No Stripe checkout session associated with this purchase", 400);
        }
        const session = await StripeService.retrieveSession(purchase.stripeSessionId);
        if (!session.invoice) {
            throw new AppError("No Stripe invoice associated with this transaction", 400);
        }
        const invoiceId = typeof session.invoice === "string" ? session.invoice : session.invoice.id;
        const invoice = await StripeService.retrieveInvoice(invoiceId);
        const pdfUrl = invoice.invoice_pdf;
        if (!pdfUrl) {
            throw new AppError("Direct invoice download link not available from Stripe", 400);
        }
        return pdfUrl;
    }
}
//# sourceMappingURL=payment.service.js.map
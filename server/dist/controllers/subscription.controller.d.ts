import type { Request, Response, NextFunction } from "express";
/**
 * POST /api/subscriptions/checkout — Initiate payment/subscription flow
 */
export declare const createCheckoutSession: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/subscriptions/verify — Verify checkout success on client landing
 */
export declare const verifySession: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/subscriptions/my-plan — Fetch current user plan features and campaign counts
 */
export declare const getMyPlan: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/subscriptions/webhook — Stripe Webhook receiver (production-ready)
 */
export declare const handleWebhook: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/subscriptions/cancel — Cancel user's subscription (at period end)
 */
export declare const cancelSubscription: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/subscriptions/my-payments — Fetch authenticated user's payment history
 */
export declare const getMyPayments: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/subscriptions/admin/payments — Fetch all payments with aggregates (Admin only)
 */
export declare const adminGetPayments: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/subscriptions/admin/cancel — Admin cancels a user's purchase/subscription (Admin only)
 */
export declare const adminCancelPurchase: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/subscriptions/purchase/:purchaseId/invoice — Fetch Stripe invoice PDF URL
 */
export declare const downloadPurchaseInvoice: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=subscription.controller.d.ts.map
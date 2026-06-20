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
//# sourceMappingURL=subscription.controller.d.ts.map
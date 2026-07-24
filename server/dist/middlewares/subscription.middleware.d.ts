import type { Request, Response, NextFunction } from "express";
/**
 * Dedicated Middleware: Validates subscription eligibility before opening checkout session.
 *
 * Rules:
 * 1. User must exist and target plan must be active.
 * 2. Active Founding Members cannot purchase Founding Member plans (Monthly or Yearly) again.
 * 3. Users cannot re-purchase the exact same plan they are currently subscribed to.
 * 4. Users who previously claimed & cancelled a Founding plan cannot claim Founding again.
 * 5. Founding slots are capped at 200 total active/claimed slots.
 */
export declare const validateCheckoutEligibility: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware: Enforces user's campaign limit before creating a new UGC campaign
 */
export declare const requireCampaignLimit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=subscription.middleware.d.ts.map
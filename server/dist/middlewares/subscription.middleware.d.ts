import type { Request, Response, NextFunction } from "express";
export declare const requireSubscription: (req: Request, res: Response, next: NextFunction) => void;
export declare const requirePaidPlan: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireCampaignLimit: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=subscription.middleware.d.ts.map
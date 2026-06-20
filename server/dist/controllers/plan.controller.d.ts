import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/plans — Get all pricing plans sorted by price
 */
export declare const getPlans: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/plans — Create a new pricing plan (Admin only)
 */
export declare const createPlan: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/plans/:id — Update a pricing plan (Admin only)
 */
export declare const updatePlan: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/plans/:id — Delete a pricing plan (Admin only)
 */
export declare const deletePlan: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=plan.controller.d.ts.map
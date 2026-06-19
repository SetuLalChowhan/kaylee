import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/user/me — Fetch the authenticated user's profile
 */
export declare const getMe: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/user/update — Update profile (firstName, lastName, servicesOffered, brandLogos) and/or avatar
 */
export declare const updateProfile: (req: Request, res: Response, next: NextFunction) => void;
export declare const completeOnboarding: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/user/brand-logo — Delete a single brand logo by its file path
 */
export declare const deleteBrandLogo: (req: Request, res: Response, next: NextFunction) => void;
export declare const changePassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateNotificationSettings: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/user/dashboard-stats — Retrieve authenticated user's dashboard metrics
 */
export declare const getDashboardStats: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=user.controller.d.ts.map
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
/**
 * GET /api/user/admin/users — Retrieve all registered users (Admin-only)
 */
export declare const adminGetAllUsers: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/user/admin/users — Admin creates a new user directly (Admin-only)
 */
export declare const adminCreateUser: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/user/admin/users/:id — Admin updates any user's profile or role (Admin-only)
 */
export declare const adminUpdateUser: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/user/admin/users/:id — Admin deletes any user (Admin-only)
 */
export declare const adminDeleteUser: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=user.controller.d.ts.map
import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/cms — Retrieve public CMS content keys & values
 * Excludes smtp_* and email_from_* keys.
 */
export declare const getCmsContent: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/cms/admin — Retrieve all CMS content keys for admin settings
 * Masks smtp_pass as "" so plaintext passwords are not leaked to frontend.
 */
export declare const getAdminCmsContent: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PUT /api/cms — Bulk create/update CMS content values (Admin-only)
 * Validates keys /^[a-z0-9_]{1,64}$/, caps length at 10,000 chars, ignores empty smtp_pass.
 */
export declare const updateCmsContent: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=cms.controller.d.ts.map
import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/cms — Retrieve all CMS content keys & values (Public)
 */
export declare const getCmsContent: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PUT /api/cms — Bulk create/update CMS content values (Admin-only)
 */
export declare const updateCmsContent: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=cms.controller.d.ts.map
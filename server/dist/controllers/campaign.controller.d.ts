import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/campaign — Retrieve all campaigns
 */
export declare const getCampaigns: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/campaign — Create a new campaign (Admin Only)
 */
export declare const createCampaign: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/campaign/:id — Update a campaign (Admin Only)
 */
export declare const updateCampaign: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/campaign/:id — Delete a campaign (Admin Only)
 */
export declare const deleteCampaign: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=campaign.controller.d.ts.map
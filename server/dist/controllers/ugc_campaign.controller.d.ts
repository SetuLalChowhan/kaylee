import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/ugc-campaigns — Retrieve creator's campaigns
 */
export declare const getUgcCampaigns: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/ugc-campaigns/:id — Retrieve full campaign details
 */
export declare const getUgcCampaignById: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/ugc-campaigns — Create a new campaign
 */
export declare const createUgcCampaign: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateUgcCampaign: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/ugc-campaigns/:id — Delete a campaign
 */
export declare const deleteUgcCampaign: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Deliverables Operations
 */
export declare const createDeliverable: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteDeliverable: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Tasks Operations
 */
export declare const createCampaignTask: (req: Request, res: Response, next: NextFunction) => void;
export declare const updateCampaignTask: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteCampaignTask: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Media Operations
 */
export declare const uploadMedia: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/ugc-campaigns/:campaignId/media/:id/replace — Replace a single media item
 */
export declare const replaceMedia: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteMedia: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Documents Operations
 */
export declare const uploadDocument: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteDocument: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Notes Operations
 */
export declare const createNote: (req: Request, res: Response, next: NextFunction) => void;
export declare const deleteNote: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Feedback Messages
 */
export declare const createFeedback: (req: Request, res: Response, next: NextFunction) => void;
/**
 * ── GUEST PUBLIC ENDPOINTS ──────────────────────────────────────────────────
 */
/**
 * GET /api/ugc-campaigns/public/:slug — Retrieve public campaign
 */
export declare const getPublicCampaignBySlug: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/ugc-campaigns/public/:slug/media/:mediaId/status — Approve file
 */
export declare const updatePublicMediaStatus: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/ugc-campaigns/public/:slug/media/:mediaId/request-changes — Request changes on media
 */
export declare const requestChangesPublicMedia: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/ugc-campaigns/public/:slug/feedback — Submit feedback chat from brand
 */
export declare const createPublicFeedback: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=ugc_campaign.controller.d.ts.map
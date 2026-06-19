import type { Request, Response, NextFunction } from "express";
/**
 * POST /api/user/portfolio — Create a new portfolio item
 */
export declare const createPortfolioItem: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/user/portfolio — Get all portfolio items for the authenticated user
 */
export declare const getPortfolioItems: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/user/portfolio/:id — Update a portfolio item's title and/or media file
 */
export declare const updatePortfolioItem: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/user/portfolio/:id — Delete a portfolio item
 */
export declare const deletePortfolioItem: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/user/portfolio-preview/:slug — Public endpoint to get user profile & portfolio items
 */
export declare const getPublicPortfolio: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=portfolio.controller.d.ts.map
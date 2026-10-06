import multer from "multer";
import type { Request, Response, NextFunction } from "express";
export declare const uploadAvatar: multer.Multer;
export declare const uploadBrandLogo: multer.Multer;
export declare const uploadPortfolio: multer.Multer;
export declare const uploadCampaignFile: multer.Multer;
export declare const uploadCmsFile: multer.Multer;
export declare const upload: multer.Multer;
/**
 * Post-upload magic bytes and MIME verification middleware.
 * Verifies that the uploaded files match allowed binary signatures.
 * Rejects and safely deletes unknown, mismatched, or SVG files.
 */
export declare const validateUploadedFiles: (category: "image" | "portfolio" | "campaign" | "cms") => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=upload.middleware.d.ts.map
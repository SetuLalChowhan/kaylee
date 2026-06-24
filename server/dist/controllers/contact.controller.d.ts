import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/contact — Get all contact submissions (Admin only)
 */
export declare const getContacts: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/contact — Create a contact message submission (Public)
 */
export declare const createContact: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PUT /api/contact/:id — Update a contact submission (Admin only)
 */
export declare const updateContact: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/contact/:id — Delete a contact submission (Admin only)
 */
export declare const deleteContact: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=contact.controller.d.ts.map
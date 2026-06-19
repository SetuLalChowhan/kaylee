import type { Request, Response, NextFunction } from "express";
/**
 * POST /api/invoice — Create a new invoice
 */
export declare const createInvoice: (req: Request, res: Response, next: NextFunction) => void;
/**
 * GET /api/invoice — Retrieve user's invoices with optional status filtering
 */
export declare const getInvoices: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/invoice/:id — Update an existing invoice
 */
export declare const updateInvoice: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/invoice/:id — Delete an invoice
 */
export declare const deleteInvoice: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=invoice.controller.d.ts.map
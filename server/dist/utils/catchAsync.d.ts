import type { Request, Response, NextFunction } from "express";
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
/**
 * Wraps an async Express handler and forwards any thrown error
 * to the global error handler via `next(err)`.
 */
export declare const catchAsync: (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=catchAsync.d.ts.map
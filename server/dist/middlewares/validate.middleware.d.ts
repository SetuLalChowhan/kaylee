import { type ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
export declare const validate: (schema: ZodType<any>) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=validate.middleware.d.ts.map
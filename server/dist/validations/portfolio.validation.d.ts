import { z } from "zod";
export declare const createPortfolioSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        targetUserId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updatePortfolioSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=portfolio.validation.d.ts.map
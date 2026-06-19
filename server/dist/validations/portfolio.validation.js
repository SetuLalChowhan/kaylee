import { z } from "zod";
export const createPortfolioSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    }),
});
export const updatePortfolioSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(100, "Title is too long").optional(),
    }),
});
//# sourceMappingURL=portfolio.validation.js.map
import { z } from "zod";
export declare const faqSchema: z.ZodObject<{
    body: z.ZodObject<{
        category: z.ZodString;
        question: z.ZodString;
        answer: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type FaqInput = z.infer<typeof faqSchema>["body"];
//# sourceMappingURL=faq.validation.d.ts.map
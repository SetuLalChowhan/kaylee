import { z } from "zod";
export const faqSchema = z.object({
    body: z.object({
        category: z.string().min(1, "Category is required").max(100),
        question: z.string().min(1, "Question is required").max(500),
        answer: z.string().min(1, "Answer is required").max(2000),
    }),
});
//# sourceMappingURL=faq.validation.js.map
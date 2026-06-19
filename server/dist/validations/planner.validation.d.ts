import { z } from "zod";
export declare const createTaskSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        campaign: z.ZodString;
        date: z.ZodString;
        completed: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateTaskSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        campaign: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        completed: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=planner.validation.d.ts.map
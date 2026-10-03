import { z } from "zod";
const dateStringSchema = z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(new Date(val).getTime()) || /^\d{4}-\d{2}-\d{2}/.test(val), "Invalid date format");
export const createTaskSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Task name is required").max(200, "Task name is too long"),
        campaign: z.string().min(1, "Campaign is required").max(100, "Campaign is too long"),
        date: dateStringSchema,
        completed: z.boolean().optional(),
        targetUserId: z.string().optional(),
    }),
});
export const updateTaskSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Task name is required").max(200, "Task name is too long").optional(),
        campaign: z.string().min(1, "Campaign is required").max(100, "Campaign is too long").optional(),
        date: dateStringSchema.optional(),
        completed: z.boolean().optional(),
    }),
});
//# sourceMappingURL=planner.validation.js.map
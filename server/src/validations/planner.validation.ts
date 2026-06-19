import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Task name is required").max(200, "Task name is too long"),
    campaign: z.string().min(1, "Campaign is required").max(100, "Campaign is too long"),
    date: z.string().min(1, "Date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    completed: z.boolean().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Task name is required").max(200, "Task name is too long").optional(),
    campaign: z.string().min(1, "Campaign is required").max(100, "Campaign is too long").optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    completed: z.boolean().optional(),
  }),
});

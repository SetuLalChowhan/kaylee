import { z } from "zod";

export const createInvoiceSchema = z.object({
  body: z.object({
    invoiceNo: z.string().min(1, "Invoice number is required").max(50, "Invoice number is too long"),
    campaign: z.string().min(1, "Campaign is required").max(100, "Campaign is too long"),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    amount: z.string().min(1, "Amount is required").max(50, "Amount is too long"),
    status: z.enum(["Pending", "Paid", "Overdue"]).optional().default("Pending"),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    invoiceNo: z.string().min(1, "Invoice number is required").max(50, "Invoice number is too long").optional(),
    campaign: z.string().min(1, "Campaign is required").max(100, "Campaign is too long").optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    amount: z.string().min(1, "Amount is required").max(50, "Amount is too long").optional(),
    status: z.enum(["Pending", "Paid", "Overdue"]).optional(),
  }),
});

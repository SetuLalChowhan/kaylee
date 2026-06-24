import { z } from "zod";

export const createContactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email format").max(255),
    message: z.string().min(1, "Message is required").max(5000),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").max(100).optional(),
    lastName: z.string().min(1, "Last name is required").max(100).optional(),
    email: z.string().min(1, "Email is required").email("Invalid email format").max(255).optional(),
    message: z.string().min(1, "Message is required").max(5000).optional(),
  }),
});

export type CreateContactInput = z.infer<typeof createContactSchema>["body"];
export type UpdateContactInput = z.infer<typeof updateContactSchema>["body"];

import { z } from "zod";

export const createCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Campaign title is required").max(100, "Campaign title is too long"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  }),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Campaign title is required").max(100, "Campaign title is too long").optional(),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  }),
});

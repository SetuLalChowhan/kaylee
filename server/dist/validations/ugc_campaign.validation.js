import { z } from "zod";
export const createUgcCampaignSchema = z.object({
    body: z.object({
        campaignName: z.string().min(1, "Campaign name is required").max(100),
        brandName: z.string().min(1, "Brand name is required").max(100),
        deadline: z.string().min(1, "Deadline is required"),
        amount: z.string().min(1, "Amount is required"),
        status: z.string().optional().default("Draft"),
        notes: z.string().optional(),
    }),
});
export const updateUgcCampaignSchema = z.object({
    body: z.object({
        campaignName: z.string().optional(),
        brandName: z.string().optional(),
        deadline: z.string().optional(),
        amount: z.string().optional(),
        status: z.string().optional(),
        releaseFiles: z.boolean().optional(),
        notes: z.string().optional(),
        paymentStatus: z.string().optional(),
    }),
});
export const createDeliverableSchema = z.object({
    body: z.object({
        text: z.string().min(1, "Text is required").max(500),
    }),
});
export const createCampaignTaskSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Task name is required").max(500),
        date: z.string().min(1, "Date is required"),
        completed: z.boolean().optional(),
    }),
});
export const updateCampaignTaskSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        date: z.string().optional(),
        completed: z.boolean().optional(),
    }),
});
export const createNoteSchema = z.object({
    body: z.object({
        text: z.string().min(1, "Text is required").max(1000),
    }),
});
export const createFeedbackSchema = z.object({
    body: z.object({
        text: z.string().min(1, "Message is required"),
        mediaId: z.string().optional(),
    }),
});
//# sourceMappingURL=ugc_campaign.validation.js.map
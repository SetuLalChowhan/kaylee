import { z } from "zod";
export declare const createUgcCampaignSchema: z.ZodObject<{
    body: z.ZodObject<{
        campaignName: z.ZodString;
        brandName: z.ZodString;
        deadline: z.ZodString;
        amount: z.ZodString;
        status: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateUgcCampaignSchema: z.ZodObject<{
    body: z.ZodObject<{
        campaignName: z.ZodOptional<z.ZodString>;
        brandName: z.ZodOptional<z.ZodString>;
        deadline: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        releaseFiles: z.ZodOptional<z.ZodBoolean>;
        notes: z.ZodOptional<z.ZodString>;
        paymentStatus: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createDeliverableSchema: z.ZodObject<{
    body: z.ZodObject<{
        text: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createCampaignTaskSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        date: z.ZodString;
        completed: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateCampaignTaskSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        completed: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createNoteSchema: z.ZodObject<{
    body: z.ZodObject<{
        text: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createFeedbackSchema: z.ZodObject<{
    body: z.ZodObject<{
        text: z.ZodString;
        mediaId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=ugc_campaign.validation.d.ts.map
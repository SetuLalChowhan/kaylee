import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        confirmPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const verifyOtpSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        otp: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        resetToken: z.ZodString;
        newPassword: z.ZodString;
        confirmPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        shortBio: z.ZodOptional<z.ZodString>;
        socialLinks: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
            instagram: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            youtube: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            other: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        }, z.core.$strip>>>;
        servicesOffered: z.ZodOptional<z.ZodString>;
        brandLogos: z.ZodPreprocess<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        oldPassword: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const onboardingSchema: z.ZodObject<{
    body: z.ZodObject<{
        displayName: z.ZodString;
        shortBio: z.ZodOptional<z.ZodString>;
        socialLinks: z.ZodPreprocess<z.ZodOptional<z.ZodObject<{
            instagram: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            youtube: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            other: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type OnboardingInput = z.infer<typeof onboardingSchema>["body"];
//# sourceMappingURL=user.validation.d.ts.map
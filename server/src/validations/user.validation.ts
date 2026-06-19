import { z } from "zod";

const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password cannot exceed 32 characters")
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "Password must contain at least one number",
  })
  .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), {
    message: "Password must contain at least one special character",
  });

export const registerSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
      lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
      email: z.string().email("Invalid email address"),
      password: passwordValidation,
      confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      resetToken: z.string().min(1, "Reset token is required"),
      newPassword: passwordValidation,
      confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

const jsonArrayParser = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  },
  z.array(z.string()).optional(),
);

export const updateProfileSchema = z.object({
  body: z.object({

    servicesOffered: z.string().max(1000, "Services offered cannot exceed 1000 characters").optional(),
    brandLogos: jsonArrayParser,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: passwordValidation,
  }),
});

// ─── Onboarding Schema ─────────────────────────────────────────────────────────

export const onboardingSchema = z.object({
  body: z.object({
    displayName: z.string().min(1, "Display name is required").max(100, "Display name is too long"),
    shortBio: z.string().max(500, "Short bio cannot exceed 500 characters").optional(),
    socialLinks: z
      .preprocess(
        (val) => {
          if (typeof val === "string") {
            try {
              return JSON.parse(val);
            } catch {
              return val;
            }
          }
          return val;
        },
        z
          .object({
            instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
            website: z.string().url("Invalid website URL").optional().or(z.literal("")),
            youtube: z.string().url("Invalid YouTube URL").optional().or(z.literal("")),
            other: z.string().url("Invalid URL").optional().or(z.literal("")),
          })
          .optional(),
      ),
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>["body"];
import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/cms — Retrieve public CMS content keys & values
 * Excludes smtp_* and email_from_* keys.
 */
export const getCmsContent = catchAsync(async (_req: Request, res: Response) => {
  const contents = await prisma.cmsContent.findMany();

  const dictionary = contents.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
    // Exclude sensitive email and smtp settings
    if (!item.key.startsWith("smtp_") && !item.key.startsWith("email_from_")) {
      acc[item.key] = item.value;
    }
    return acc;
  }, {} as Record<string, string>);

  res.status(200).json({
    status: "success",
    data: dictionary,
  });
});

/**
 * GET /api/cms/admin — Retrieve all CMS content keys for admin settings
 * Masks smtp_pass as "" so plaintext passwords are not leaked to frontend.
 */
export const getAdminCmsContent = catchAsync(async (_req: Request, res: Response) => {
  const contents = await prisma.cmsContent.findMany();

  const dictionary = contents.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
    if (item.key === "smtp_pass") {
      acc[item.key] = ""; // Mask password
    } else {
      acc[item.key] = item.value;
    }
    return acc;
  }, {} as Record<string, string>);

  res.status(200).json({
    status: "success",
    data: dictionary,
  });
});

/**
 * PUT /api/cms — Bulk create/update CMS content values (Admin-only)
 * Validates keys /^[a-z0-9_]{1,64}$/, caps length at 10,000 chars, ignores empty smtp_pass.
 */
export const updateCmsContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const updates = req.body as Record<string, any>;

  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return next(new AppError("Invalid updates payload", 400));
  }

  const keyRegex = /^[a-z0-9_]{1,64}$/;
  const entries = Object.entries(updates);

  for (const [key, rawValue] of entries) {
    if (!keyRegex.test(key)) {
      return next(
        new AppError(
          `Invalid CMS key format: "${key}". Only lowercase letters, digits, and underscores (max 64 chars) are allowed.`,
          400
        )
      );
    }

    if (rawValue === undefined || rawValue === null) continue;

    const value = String(rawValue);
    if (value.length > 10000) {
      return next(
        new AppError(
          `Value for key "${key}" exceeds maximum allowed length of 10,000 characters.`,
          400
        )
      );
    }

    // Ignore empty smtp_pass to prevent wiping the existing password
    if (key === "smtp_pass" && value.trim() === "") {
      continue;
    }

    await prisma.cmsContent.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  res.status(200).json({
    status: "success",
    message: "CMS Content updated successfully",
  });
});

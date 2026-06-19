import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/cms — Retrieve all CMS content keys & values (Public)
 */
export const getCmsContent = catchAsync(async (req: Request, res: Response) => {
  const contents = await prisma.cmsContent.findMany();
  
  const dictionary = contents.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);

  res.status(200).json({
    status: "success",
    data: dictionary
  });
});

/**
 * PUT /api/cms — Bulk create/update CMS content values (Admin-only)
 */
export const updateCmsContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const updates = req.body as Record<string, string>;

  if (!updates || typeof updates !== "object") {
    return next(new AppError("Invalid updates payload", 400));
  }

  const entries = Object.entries(updates);
  
  for (const [key, value] of entries) {
    await prisma.cmsContent.upsert({
      where: { key },
      create: { key, value },
      update: { value }
    });
  }

  res.status(200).json({
    status: "success",
    message: "CMS Content updated successfully"
  });
});

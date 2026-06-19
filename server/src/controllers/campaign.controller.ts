import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

/**
 * GET /api/campaign — Retrieve all campaigns
 */
export const getCampaigns = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { title: "asc" },
  });

  res.status(200).json({
    status: "success",
    data: campaigns,
  });
});

/**
 * POST /api/campaign — Create a new campaign (Admin Only)
 */
export const createCampaign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body as {
    title: string;
    description?: string;
  };

  const existingCampaign = await prisma.campaign.findUnique({
    where: { title },
  });

  if (existingCampaign) {
    return next(new AppError("Campaign with this title already exists", 400));
  }

  const campaign = await prisma.campaign.create({
    data: {
      title,
      description: description ?? null,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Campaign created successfully",
    data: campaign,
  });
});

/**
 * PATCH /api/campaign/:id — Update a campaign (Admin Only)
 */
export const updateCampaign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };
  const { title, description } = req.body as {
    title?: string;
    description?: string;
  };

  const existingCampaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!existingCampaign) {
    return next(new AppError("Campaign not found", 404));
  }

  if (title) {
    const duplicateTitleCampaign = await prisma.campaign.findFirst({
      where: {
        title,
        id: { not: id },
      },
    });
    if (duplicateTitleCampaign) {
      return next(new AppError("Another campaign with this title already exists", 400));
    }
  }

  const updatedCampaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description: description ?? null }),
    },
  });

  res.status(200).json({
    status: "success",
    message: "Campaign updated successfully",
    data: updatedCampaign,
  });
});

/**
 * DELETE /api/campaign/:id — Delete a campaign (Admin Only)
 */
export const deleteCampaign = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id: string };

  const existingCampaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!existingCampaign) {
    return next(new AppError("Campaign not found", 404));
  }

  await prisma.campaign.delete({
    where: { id },
  });

  res.status(200).json({
    status: "success",
    message: "Campaign deleted successfully",
  });
});

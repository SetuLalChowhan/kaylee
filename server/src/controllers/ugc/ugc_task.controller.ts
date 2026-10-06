import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { checkCampaignAccess } from "./ugc_helper.js";

/**
 * POST /api/ugc-campaigns/:campaignId/tasks — Create a campaign task
 */
export const createCampaignTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId } = req.params as { campaignId: string };
    const { name, date, completed } = req.body as {
      name: string;
      date: string;
      completed?: boolean;
    };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const task = await prisma.$transaction(async (tx) => {
      const plannerTask = await tx.task.create({
        data: {
          userId: campaign.userId,
          name,
          campaign: campaign.name,
          date,
          completed: completed ?? false,
        },
      });

      return tx.ugcCampaignTask.create({
        data: {
          campaignId,
          name,
          date,
          completed: completed ?? false,
          plannerTaskId: plannerTask.id,
        },
      });
    });

    res.status(201).json({ status: "success", data: task });
  }
);

/**
 * PATCH /api/ugc-campaigns/:campaignId/tasks/:id — Update a campaign task
 */
export const updateCampaignTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };
    const { name, date, completed } = req.body as {
      name?: string;
      date?: string;
      completed?: boolean;
    };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const existingTask = await prisma.ugcCampaignTask.findFirst({
      where: { id, campaignId: campaign.id },
    });
    if (!existingTask) return next(new AppError("Task not found", 404));

    const task = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.ugcCampaignTask.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(date !== undefined && { date }),
          ...(completed !== undefined && { completed }),
        },
      });

      if (existingTask.plannerTaskId) {
        await tx.task
          .update({
            where: { id: existingTask.plannerTaskId },
            data: {
              ...(name !== undefined && { name }),
              ...(date !== undefined && { date }),
              ...(completed !== undefined && { completed }),
            },
          })
          .catch((err) => {
            console.warn("Failed to sync planner task update: ", err);
          });
      }

      return updatedTask;
    });

    res.status(200).json({ status: "success", data: task });
  }
);

/**
 * DELETE /api/ugc-campaigns/:campaignId/tasks/:id — Delete a campaign task
 */
export const deleteCampaignTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { campaignId, id } = req.params as { campaignId: string; id: string };

    const campaign = await checkCampaignAccess(campaignId, req);
    if (!campaign)
      return next(new AppError("Campaign not found or unauthorized", 404));

    const existingTask = await prisma.ugcCampaignTask.findFirst({
      where: { id, campaignId: campaign.id },
    });
    if (!existingTask) return next(new AppError("Task not found", 404));

    await prisma.$transaction(async (tx) => {
      if (existingTask.plannerTaskId) {
        await tx.task
          .delete({ where: { id: existingTask.plannerTaskId } })
          .catch((err) => {
            console.warn("Failed to sync planner task deletion: ", err);
          });
      }

      await tx.ugcCampaignTask.deleteMany({ where: { id, campaignId: campaign.id } });
    });

    res
      .status(200)
      .json({ status: "success", message: "Task deleted successfully" });
  }
);

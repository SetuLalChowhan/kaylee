import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
/**
 * GET /api/planner — Retrieve user's planner tasks
 */
export const getTasks = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const isAdmin = role === "admin";
    const tasks = await prisma.task.findMany({
        where: isAdmin ? {} : { userId },
        orderBy: { date: "asc" },
    });
    res.status(200).json({
        status: "success",
        data: tasks,
    });
});
/**
 * POST /api/planner — Create a new task
 */
export const createTask = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const { name, campaign, date, completed, targetUserId } = req.body;
    // Auto-create campaign in the database if it doesn't exist (and is not empty or the default 'Content Creation')
    if (campaign && campaign !== "Content Creation") {
        const dbCampaign = await prisma.campaign.findUnique({
            where: { title: campaign },
        });
        if (!dbCampaign) {
            await prisma.campaign.create({
                data: {
                    title: campaign,
                    description: `Auto-created via task ${name}`,
                },
            });
        }
    }
    const task = await prisma.task.create({
        data: {
            userId: (role === "admin" && targetUserId) ? targetUserId : userId,
            name,
            campaign,
            date,
            completed: completed ?? false,
        },
    });
    res.status(201).json({
        status: "success",
        message: "Task created successfully",
        data: task,
    });
});
/**
 * PATCH /api/planner/:id — Update a task
 */
export const updateTask = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const isAdmin = role === "admin";
    const { id } = req.params;
    const { name, campaign, date, completed } = req.body;
    const existingTask = await prisma.task.findFirst({
        where: isAdmin ? { id } : { id, userId },
    });
    if (!existingTask) {
        return next(new AppError("Task not found or unauthorized", 404));
    }
    // Auto-create campaign in the database if it doesn't exist (and is not empty or the default 'Content Creation')
    if (campaign && campaign !== "Content Creation") {
        const dbCampaign = await prisma.campaign.findUnique({
            where: { title: campaign },
        });
        if (!dbCampaign) {
            await prisma.campaign.create({
                data: {
                    title: campaign,
                    description: `Auto-created via task update ${name || existingTask.name}`,
                },
            });
        }
    }
    const updatedTask = await prisma.task.update({
        where: { id },
        data: {
            ...(name !== undefined && { name }),
            ...(campaign !== undefined && { campaign }),
            ...(date !== undefined && { date }),
            ...(completed !== undefined && { completed }),
        },
    });
    // Sync updates back to the UgcCampaignTask and parent UgcCampaign if linked
    const campaignTasks = await prisma.ugcCampaignTask.findMany({
        where: { plannerTaskId: id },
    });
    for (const cTask of campaignTasks) {
        // 1. Sync UgcCampaignTask fields
        await prisma.ugcCampaignTask.update({
            where: { id: cTask.id },
            data: {
                ...(date !== undefined && { date }),
                ...(completed !== undefined && { completed }),
            },
        });
        // 2. If it is the main campaign due date, sync the parent campaign's deadline
        if (cTask.name === "Campaign Due Date" && date !== undefined) {
            await prisma.ugcCampaign.update({
                where: { id: cTask.campaignId },
                data: { deadline: date },
            });
        }
    }
    res.status(200).json({
        status: "success",
        message: "Task updated successfully",
        data: updatedTask,
    });
});
/**
 * DELETE /api/planner/:id — Delete a task
 */
export const deleteTask = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const isAdmin = role === "admin";
    const { id } = req.params;
    const existingTask = await prisma.task.findFirst({
        where: isAdmin ? { id } : { id, userId },
    });
    if (!existingTask) {
        return next(new AppError("Task not found or unauthorized", 404));
    }
    await prisma.task.delete({
        where: { id },
    });
    res.status(200).json({
        status: "success",
        message: "Task deleted successfully",
    });
});
//# sourceMappingURL=planner.controller.js.map
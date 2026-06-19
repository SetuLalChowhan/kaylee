import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

interface AuthRequest extends Request {
  user: { userId: string };
}

/**
 * GET /api/planner — Retrieve user's planner tasks
 */
export const getTasks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;

  const tasks = await prisma.task.findMany({
    where: { userId },
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
export const createTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { name, campaign, date, completed } = req.body as {
    name: string;
    campaign: string;
    date: string;
    completed?: boolean;
  };

  const task = await prisma.task.create({
    data: {
      userId,
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
export const updateTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { id } = req.params as { id: string };
  const { name, campaign, date, completed } = req.body as {
    name?: string;
    campaign?: string;
    date?: string;
    completed?: boolean;
  };

  const existingTask = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existingTask) {
    return next(new AppError("Task not found or unauthorized", 404));
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

  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    data: updatedTask,
  });
});

/**
 * DELETE /api/planner/:id — Delete a task
 */
export const deleteTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = (req as AuthRequest).user;
  const { id } = req.params as { id: string };

  const existingTask = await prisma.task.findFirst({
    where: { id, userId },
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

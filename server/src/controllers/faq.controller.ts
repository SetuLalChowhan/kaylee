import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

export const getFaqs = catchAsync(async (req: Request, res: Response) => {
  const faqs = await prisma.faq.findMany({
    orderBy: { createdAt: "asc" }
  });
  res.status(200).json({
    status: "success",
    data: faqs
  });
});

export const createFaq = catchAsync(async (req: Request, res: Response) => {
  const { category, question, answer } = req.body;

  const faq = await prisma.faq.create({
    data: { category, question, answer }
  });

  res.status(201).json({
    status: "success",
    message: "FAQ created successfully",
    data: faq
  });
});

export const updateFaq = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { category, question, answer } = req.body;

  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) return next(new AppError("FAQ not found", 404));

  const faq = await prisma.faq.update({
    where: { id },
    data: { category, question, answer }
  });

  res.status(200).json({
    status: "success",
    message: "FAQ updated successfully",
    data: faq
  });
});

export const deleteFaq = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) return next(new AppError("FAQ not found", 404));

  await prisma.faq.delete({ where: { id } });

  res.status(200).json({
    status: "success",
    message: "FAQ deleted successfully"
  });
});

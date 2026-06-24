import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/contact — Get all contact submissions (Admin only)
 */
export const getContacts = catchAsync(async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({
    status: "success",
    data: contacts,
  });
});

/**
 * POST /api/contact — Create a contact message submission (Public)
 */
export const createContact = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, message } = req.body;

  const contact = await prisma.contact.create({
    data: { firstName, lastName, email, message },
  });

  res.status(201).json({
    status: "success",
    message: "Your message has been sent successfully!",
    data: contact,
  });
});

/**
 * PUT /api/contact/:id — Update a contact submission (Admin only)
 */
export const updateContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { firstName, lastName, email, message } = req.body;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) return next(new AppError("Contact message not found", 404));

  const contact = await prisma.contact.update({
    where: { id },
    data: { firstName, lastName, email, message },
  });

  res.status(200).json({
    status: "success",
    message: "Contact message updated successfully",
    data: contact,
  });
});

/**
 * DELETE /api/contact/:id — Delete a contact submission (Admin only)
 */
export const deleteContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) return next(new AppError("Contact message not found", 404));

  await prisma.contact.delete({ where: { id } });

  res.status(200).json({
    status: "success",
    message: "Contact message deleted successfully",
  });
});

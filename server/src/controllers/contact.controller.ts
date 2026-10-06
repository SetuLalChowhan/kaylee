import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { sendEmail } from "../services/email.service.js";

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * POST /api/contact — Create a contact message submission (Public)
 */
export const createContact = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, message } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  const contact = await prisma.contact.create({
    data: {
      firstName: firstName ? String(firstName).trim() : "",
      lastName: lastName ? String(lastName).trim() : "",
      email: normalizedEmail,
      message: String(message),
    },
  });

  // Auto-reply spam protection: check if an auto-reply was already sent to this email within the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentPreviousSubmission = await prisma.contact.findFirst({
    where: {
      email: normalizedEmail,
      createdAt: { gte: oneHourAgo },
      id: { not: contact.id },
    },
  });

  if (!recentPreviousSubmission) {
    try {
      const safeFirstName = escapeHtml(firstName || "");
      const safeMessage = escapeHtml(message || "");

      await sendEmail(
        normalizedEmail,
        "We've received your message!",
        `<h1>Hello ${safeFirstName},</h1>
         <p>Thank you for reaching out to STAKD Support. We have received your query and our team will get back to you shortly.</p>
         <p style="border-left: 3px solid #ccc; padding-left: 10px; font-style: italic; color: #555;">
           "${safeMessage}"
         </p>
         <p>Best regards,<br/>STAKD Support Team</p>`,
        "support"
      );
    } catch (err) {
      console.error("Failed to send contact auto-reply:", err);
    }
  }

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

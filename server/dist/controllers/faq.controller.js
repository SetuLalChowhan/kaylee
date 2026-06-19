import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
export const getFaqs = catchAsync(async (req, res) => {
    const faqs = await prisma.faq.findMany({
        orderBy: { createdAt: "asc" }
    });
    res.status(200).json({
        status: "success",
        data: faqs
    });
});
export const createFaq = catchAsync(async (req, res) => {
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
export const updateFaq = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const { category, question, answer } = req.body;
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing)
        return next(new AppError("FAQ not found", 404));
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
export const deleteFaq = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing)
        return next(new AppError("FAQ not found", 404));
    await prisma.faq.delete({ where: { id } });
    res.status(200).json({
        status: "success",
        message: "FAQ deleted successfully"
    });
});
//# sourceMappingURL=faq.controller.js.map
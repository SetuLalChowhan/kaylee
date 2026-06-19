import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import fs from "fs";
/**
 * POST /api/user/portfolio — Create a new portfolio item
 */
export const createPortfolioItem = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { title } = req.body;
    if (!req.file) {
        return next(new AppError("Media file is required", 400));
    }
    const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
    const url = req.file.path.replace(/\\/g, "/");
    const newItem = await prisma.portfolioItem.create({
        data: {
            userId,
            title,
            type,
            url,
        },
    });
    res.status(201).json({
        status: "success",
        message: "Portfolio item created successfully",
        data: newItem,
    });
});
/**
 * GET /api/user/portfolio — Get all portfolio items for the authenticated user
 */
export const getPortfolioItems = catchAsync(async (req, res) => {
    const { userId } = req.user;
    const items = await prisma.portfolioItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    res.status(200).json({
        status: "success",
        data: items,
    });
});
/**
 * PATCH /api/user/portfolio/:id — Update a portfolio item's title and/or media file
 */
export const updatePortfolioItem = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { id } = req.params;
    const { title } = req.body;
    if (!id)
        return next(new AppError("Portfolio item ID is required", 400));
    const existingItem = await prisma.portfolioItem.findUnique({ where: { id } });
    if (!existingItem) {
        return next(new AppError("Portfolio item not found", 404));
    }
    if (existingItem.userId !== userId) {
        return next(new AppError("You do not have permission to modify this item", 403));
    }
    let url = existingItem.url;
    let type = existingItem.type;
    if (req.file) {
        if (fs.existsSync(existingItem.url)) {
            try {
                fs.unlinkSync(existingItem.url);
            }
            catch (err) {
                // ignore disk deletion errors in case file doesn't exist anymore
            }
        }
        url = req.file.path.replace(/\\/g, "/");
        type = req.file.mimetype.startsWith("video/") ? "video" : "image";
    }
    const updatedItem = await prisma.portfolioItem.update({
        where: { id },
        data: {
            ...(title && { title }),
            url,
            type,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Portfolio item updated successfully",
        data: updatedItem,
    });
});
/**
 * DELETE /api/user/portfolio/:id — Delete a portfolio item
 */
export const deletePortfolioItem = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { id } = req.params;
    if (!id)
        return next(new AppError("Portfolio item ID is required", 400));
    const existingItem = await prisma.portfolioItem.findUnique({ where: { id } });
    if (!existingItem) {
        return next(new AppError("Portfolio item not found", 404));
    }
    if (existingItem.userId !== userId) {
        return next(new AppError("You do not have permission to delete this item", 403));
    }
    if (fs.existsSync(existingItem.url)) {
        try {
            fs.unlinkSync(existingItem.url);
        }
        catch (err) {
            // ignore
        }
    }
    await prisma.portfolioItem.delete({ where: { id } });
    res.status(200).json({
        status: "success",
        message: "Portfolio item deleted successfully",
    });
});
/**
 * GET /api/user/portfolio-preview/:slug — Public endpoint to get user profile & portfolio items
 */
export const getPublicPortfolio = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    if (!slug)
        return next(new AppError("User slug/displayName is required", 400));
    const user = await prisma.user.findFirst({
        where: {
            slug: {
                equals: slug,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            shortBio: true,
            socialLinks: true,
            servicesOffered: true,
            brandLogos: true,
            avatar: true,
            createdAt: true,
        },
    });
    if (!user) {
        return next(new AppError("Portfolio not found for this user", 404));
    }
    const items = await prisma.portfolioItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    res.status(200).json({
        status: "success",
        data: {
            profile: user,
            portfolioItems: items,
        },
    });
});
//# sourceMappingURL=portfolio.controller.js.map
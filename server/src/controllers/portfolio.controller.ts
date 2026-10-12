import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { normalizeUploadPath, safeUnlink } from "../utils/upload.util.js";
import { requireUserId } from "../middlewares/auth.middleware.js";

interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

/**
 * POST /api/user/portfolio — Create a new portfolio item
 */
export const createPortfolioItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const role = (req as AuthRequest).user?.role;
  const { title, targetUserId } = req.body as { title: string; targetUserId?: string };

  if (!req.file) {
    return next(new AppError("Media file is required", 400));
  }

  const type = req.file.mimetype.startsWith("video/") ? "video" : "image";
  if (type === "image" && req.file.size > 50 * 1024 * 1024) {
    safeUnlink(req.file.path);
    return next(new AppError("Image file size must be less than 50MB", 400));
  }
  if (type === "video" && req.file.size > 500 * 1024 * 1024) {
    safeUnlink(req.file.path);
    return next(new AppError("Video file size must be less than 500MB", 400));
  }

  const url = normalizeUploadPath(req.file.path);
  const finalUserId = (role === "admin" && targetUserId) ? targetUserId : userId;

  try {
    const newItem = await prisma.portfolioItem.create({
      data: {
        userId: finalUserId,
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
  } catch (err) {
    safeUnlink(req.file.path);
    throw err;
  }
});

/**
 * GET /api/user/portfolio — Get all portfolio items for the authenticated user
 */
export const getPortfolioItems = catchAsync(async (req: Request, res: Response) => {
  const userId = requireUserId(req);

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
export const updatePortfolioItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const role = (req as AuthRequest).user?.role;
  const { id } = req.params as { id: string };
  const { title } = req.body as { title?: string };

  if (!id) {
    if (req.file) safeUnlink(req.file.path);
    return next(new AppError("Portfolio item ID is required", 400));
  }

  const existingItem = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!existingItem) {
    if (req.file) safeUnlink(req.file.path);
    return next(new AppError("Portfolio item not found", 404));
  }

  if (existingItem.userId !== userId && role !== "admin") {
    if (req.file) safeUnlink(req.file.path);
    return next(new AppError("You do not have permission to modify this item", 403));
  }

  let url = existingItem.url;
  let type = existingItem.type;

  if (req.file) {
    type = req.file.mimetype.startsWith("video/") ? "video" : "image";
    if (type === "image" && req.file.size > 50 * 1024 * 1024) {
      safeUnlink(req.file.path);
      return next(new AppError("Image file size must be less than 50MB", 400));
    }
    if (type === "video" && req.file.size > 500 * 1024 * 1024) {
      safeUnlink(req.file.path);
      return next(new AppError("Video file size must be less than 500MB", 400));
    }

    safeUnlink(existingItem.url);
    url = normalizeUploadPath(req.file.path);
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
export const deletePortfolioItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = requireUserId(req);
  const role = (req as AuthRequest).user?.role;
  const { id } = req.params as { id: string };

  if (!id) return next(new AppError("Portfolio item ID is required", 400));

  const existingItem = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!existingItem) {
    return next(new AppError("Portfolio item not found", 404));
  }

  if (existingItem.userId !== userId && role !== "admin") {
    return next(new AppError("You do not have permission to delete this item", 403));
  }

  safeUnlink(existingItem.url);

  await prisma.portfolioItem.delete({ where: { id } });

  res.status(200).json({
    status: "success",
    message: "Portfolio item deleted successfully",
  });
});

/**
 * GET /api/user/portfolio-preview/:slug — Public endpoint to get user profile & portfolio items
 */
export const getPublicPortfolio = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params as { slug: string };

  if (!slug) return next(new AppError("User slug/displayName is required", 400));

  let user: any;
  try {
    user = await prisma.user.findFirst({
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
        slug: true,
        shortBio: true,
        socialLinks: true,
        servicesOffered: true,
        brandLogos: true,
        avatar: true,
        createdAt: true,
        showClientRating: true,
      },
    });
  } catch {
    user = await prisma.user.findFirst({
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
        slug: true,
        shortBio: true,
        socialLinks: true,
        servicesOffered: true,
        brandLogos: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  if (!user) {
    return next(new AppError("Portfolio not found for this user", 404));
  }

  let userSocial: Record<string, any> = {};
  if (typeof user.socialLinks === "string") {
    try {
      userSocial = JSON.parse(user.socialLinks);
    } catch {
      userSocial = {};
    }
  } else if (user.socialLinks && typeof user.socialLinks === "object") {
    userSocial = user.socialLinks as Record<string, any>;
  }

  const isRatingVisible = (user as any).showClientRating !== undefined && (user as any).showClientRating !== null
    ? Boolean((user as any).showClientRating)
    : userSocial?.showClientRating !== undefined
      ? Boolean(userSocial.showClientRating)
      : true;

  let avgRatingValue: string | null = null;
  let totalRatings = 0;

  if (isRatingVisible) {
    const ratedCampaigns = await prisma.ugcCampaign.findMany({
      where: {
        userId: user.id,
        rating: { not: null },
      },
      select: { rating: true },
    });
    totalRatings = ratedCampaigns.length;
    avgRatingValue = totalRatings > 0
      ? (ratedCampaigns.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / totalRatings).toFixed(1)
      : "0";
  }

  const items = await prisma.portfolioItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    status: "success",
    data: {
      profile: {
        ...user,
        showClientRating: isRatingVisible,
        clientSatisfaction: isRatingVisible ? avgRatingValue : null,
        ratingCount: isRatingVisible ? totalRatings : 0,
      },
      portfolioItems: items,
    },
  });
});

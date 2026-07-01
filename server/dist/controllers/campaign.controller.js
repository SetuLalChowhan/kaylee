import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
/**
 * GET /api/campaign — Retrieve all campaigns (returns only user-created UGC campaigns)
 */
export const getCampaigns = catchAsync(async (req, res, next) => {
    const { userId, role } = req.user;
    const isAdmin = role === "admin";
    const userUgcCampaigns = await prisma.ugcCampaign.findMany({
        where: isAdmin ? {} : { userId },
        orderBy: { name: "asc" },
    });
    const mappedCampaigns = userUgcCampaigns.map((uc) => ({
        id: uc.id,
        title: uc.name,
        description: uc.notes || null,
        amount: uc.amount,
        createdAt: uc.createdAt,
        updatedAt: uc.updatedAt,
    }));
    res.status(200).json({
        status: "success",
        data: mappedCampaigns,
    });
});
/**
 * POST /api/campaign — Create a new campaign (Admin Only)
 */
export const createCampaign = catchAsync(async (req, res, next) => {
    const { title, description } = req.body;
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
export const updateCampaign = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, description } = req.body;
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
export const deleteCampaign = catchAsync(async (req, res, next) => {
    const { id } = req.params;
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
//# sourceMappingURL=campaign.controller.js.map
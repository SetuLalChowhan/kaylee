import type { Request, Response } from "express";
import prisma from "../../config/db.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { requireUserId } from "../../middlewares/auth.middleware.js";

/**
 * GET /api/ugc-campaigns/analytics — Get creator analytics overview
 */
export const getAnalytics = catchAsync(
  async (req: Request, res: Response) => {
    const userId = requireUserId(req);

    const monthsParam = parseInt(req.query.months as string) || 6;
    const monthsToFetch = isNaN(monthsParam) || monthsParam < 1 ? 6 : monthsParam;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToFetch + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const campaigns = await prisma.ugcCampaign.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentStatus: true,
        rating: true,
        name: true,
        brandName: true,
        createdAt: true,
      },
    });

    const paidIncome = campaigns
      .filter((c) => c.paymentStatus === "Paid")
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const completedCampaigns = campaigns.filter((c) => c.status === "Approved" || c.status === "Completed" || c.status === "Delivered").length;

    const ratedCampaigns = campaigns.filter((c) => c.rating);
    const avgRating = ratedCampaigns.length ? (ratedCampaigns.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedCampaigns.length).toFixed(1) : 0;

    const earningsOverview = [];
    const deliverablesCompletedGraph = [];

    for (let i = monthsToFetch - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();

      const monthCampaigns = campaigns.filter((c) => {
        const cDate = new Date(c.createdAt);
        return cDate.getMonth() === d.getMonth() && cDate.getFullYear() === year;
      });

      const income = monthCampaigns
        .filter((c) => c.paymentStatus === "Paid")
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

      const completedCount = monthCampaigns.filter((c) => c.status === "Approved" || c.status === "Completed" || c.status === "Delivered").length;

      earningsOverview.push({ name: monthStr, totalEarnings: income });
      deliverablesCompletedGraph.push({ name: monthStr, totalDeliverables: completedCount });
    }

    const statusCounts = campaigns.reduce((acc: any, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const colors = ["#0084FF", "#A855F7", "#EC4899", "#EAB308"];
    const campaignStatusData = Object.keys(statusCounts).map((key, i) => ({
      name: key,
      value: statusCounts[key],
      color: colors[i % colors.length],
    }));

    const maxAmount = campaigns.reduce((max, c) => Math.max(max, parseFloat(c.amount) || 0), 0);
    const topCampaigns = [...campaigns]
      .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))
      .slice(0, 4)
      .map((c) => {
        const amountNum = parseFloat(c.amount) || 0;
        return {
          id: c.id,
          name: c.name,
          brandName: c.brandName,
          amount: c.amount,
          status: c.status,
          rating: c.rating,
          percentage: maxAmount > 0 ? (amountNum / maxAmount) * 100 : 0,
        };
      });

    res.status(200).json({
      status: "success",
      data: {
        totalIncome: paidIncome,
        completedCampaigns,
        avgRating,
        earningsOverview,
        deliverablesCompletedGraph,
        campaignStatusData,
        topCampaigns,
      },
    });
  }
);

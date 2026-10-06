import type { Request, Response } from "express";
import prisma from "../../config/db.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { requireUserId } from "../../middlewares/auth.middleware.js";
import type { AuthRequest } from "./user_helper.js";

/**
 * GET /api/user/dashboard-stats — Retrieve authenticated user's dashboard metrics
 */
export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const role = (req as AuthRequest).user?.role;
  const isAdmin = role === "admin";
  const totalUsersCount = isAdmin ? await prisma.user.count() : null;

  // 1. Stats Card calculations
  const activeCampaignsCount = await prisma.ugcCampaign.count({
    where: {
      ...(isAdmin ? {} : { userId }),
    },
  });

  const awaitingReviewCount = await prisma.ugcCampaign.count({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: "Under Review",
    },
  });

  const completedCampaignsCount = await prisma.ugcCampaign.count({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: "Completed",
    },
  });

  const campaigns = await prisma.ugcCampaign.findMany({
    where: isAdmin ? {} : { userId },
    select: { amount: true, status: true, paymentStatus: true },
  });

  // Calculate earnings: Paid Invoices + Completed Unpaid Campaigns (to cover both models)
  const invoices = await prisma.invoice.findMany({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: "Paid",
    },
    select: { amount: true },
  });

  const invoiceEarned = invoices.reduce((sum: number, inv: any) => {
    const cleanAmount = inv.amount.replace(/[^0-9.]/g, "");
    const amt = parseFloat(cleanAmount) || 0;
    return sum + amt;
  }, 0);

  const completedCampaignsEarned = campaigns
    .filter((c: any) => c.status === "Completed" && c.paymentStatus !== "Paid")
    .reduce((sum: number, c: any) => {
      const cleanAmount = c.amount.replace(/[^0-9.]/g, "");
      const amt = parseFloat(cleanAmount) || 0;
      return sum + amt;
    }, 0);

  const totalEarnedValue = invoiceEarned + completedCampaignsEarned;

  const totalInvoicesCount = await prisma.invoice.count({
    where: isAdmin ? {} : { userId },
  });

  const stripeIncomeSum = await prisma.purchase.aggregate({
    where: isAdmin ? { status: "completed" } : { userId, status: "completed" },
    _sum: {
      amount: true,
    },
  });
  const stripeIncomeValue = stripeIncomeSum._sum.amount ?? 0;

  // 2. Recent Active/Draft campaigns (up to 6)
  const recentCampaigns = await prisma.ugcCampaign.findMany({
    where: isAdmin ? {} : { userId },
    include: {
      deliverables: { orderBy: { createdAt: "asc" } },
      tasks: { orderBy: { createdAt: "asc" } },
      media: { select: { id: true, name: true, type: true, status: true } },
      feedback: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  // 3. Upcoming Deadlines (up to 5)
  const activeCampaignsForDeadlines = await prisma.ugcCampaign.findMany({
    where: {
      ...(isAdmin ? {} : { userId }),
      status: { not: "Completed" },
      deadline: { not: "" },
    },
    select: {
      id: true,
      name: true,
      brandName: true,
      deadline: true,
    },
  });

  const parsedDeadlines = activeCampaignsForDeadlines
    .map((c: any) => {
      const date = new Date(c.deadline);
      return {
        id: c.id,
        title: c.brandName,
        sub: c.name,
        date,
        rawDate: c.deadline,
        day: isNaN(date.getTime()) ? "" : date.getDate().toString().padStart(2, "0"),
        month: isNaN(date.getTime()) ? "" : date.toLocaleString("en-US", { month: "short" }),
      };
    })
    .filter((d: any) => d.day !== "")
    .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)
    .map(({ id, title, sub, day, month, rawDate }: any) => ({ id, title, sub, day, month, rawDate }));

  // 4. Pending & Upcoming Tasks from Planner (up to 5)
  const tasks = await prisma.task.findMany({
    where: isAdmin ? {} : { userId },
    orderBy: [
      { completed: "asc" },
      { date: "asc" },
    ],
    take: 5,
  });

  const parsedTasks = tasks.map((t: any) => {
    const dateObj = new Date(t.date);
    let formattedDate = t.date;
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" });
    }
    return {
      id: t.id,
      title: t.name,
      sub: t.campaign,
      date: formattedDate,
      rawDate: t.date,
      completed: t.completed,
    };
  });

  // 5. Generate monthly trends data (last 6 months) for stats visualization
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const trendCampaigns = await prisma.ugcCampaign.findMany({
    where: {
      ...(isAdmin ? {} : { userId }),
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true },
  });

  const trendInvoices = await prisma.invoice.findMany({
    where: {
      ...(isAdmin ? {} : { userId }),
      createdAt: { gte: sixMonthsAgo },
    },
    select: { createdAt: true, amount: true, status: true },
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap = new Map<string, { month: string; campaigns: number; earnings: number }>();

  // Pre-populate last 6 months in order
  for (let i = 0; i < 6; i++) {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - (5 - i));
    const mName = months[targetDate.getMonth()];
    const key = `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
    monthlyMap.set(key, {
      month: `${mName} ${targetDate.getFullYear().toString().slice(-2)}`,
      campaigns: 0,
      earnings: 0,
    });
  }

  // Populate campaign counts
  trendCampaigns.forEach((c: any) => {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap.has(key)) {
      const data = monthlyMap.get(key)!;
      data.campaigns += 1;
    }
  });

  // Populate invoice earnings
  trendInvoices.forEach((inv: any) => {
    const d = new Date(inv.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap.has(key)) {
      const data = monthlyMap.get(key)!;
      if (inv.status === "Paid") {
        const cleanAmount = inv.amount.replace(/[^0-9.]/g, "");
        const amt = parseFloat(cleanAmount) || 0;
        data.earnings += amt;
      }
    }
  });

  const monthlyTrends = Array.from(monthlyMap.values());

  res.status(200).json({
    status: "success",
    data: {
      stats: {
        activeCampaigns: activeCampaignsCount,
        awaitingReview: awaitingReviewCount,
        completedCampaigns: completedCampaignsCount,
        totalEarned: totalEarnedValue,
        totalInvoices: totalInvoicesCount,
        stripeIncome: stripeIncomeValue,
        totalUsers: totalUsersCount,
      },
      recentCampaigns,
      deadlines: parsedDeadlines,
      tasks: parsedTasks,
      monthlyTrends,
    },
  });
});

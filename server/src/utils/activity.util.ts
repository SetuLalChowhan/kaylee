import prisma from "../config/db.js";

export interface LogActivityParams {
  userId: string;
  title: string;
  sub?: string;
  avatarBg?: string;
  avatarText?: string;
  dotColor?: string;
  type?: string;
  campaignId?: string;
}

export async function logActivity(params: LogActivityParams) {
  try {
    return await (prisma as any).activity.create({
      data: {
        userId: params.userId,
        title: params.title,
        sub: params.sub || "",
        avatarBg: params.avatarBg || "bg-[#FCE4EC]",
        avatarText: params.avatarText || "STAKD",
        dotColor: params.dotColor || null,
        type: params.type || "GENERAL",
        campaignId: params.campaignId || null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}

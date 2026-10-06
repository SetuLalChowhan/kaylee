import prisma from "../config/db.js";

export async function logApprovalAudit(data: {
  campaignId: string;
  mediaId?: string | null | undefined;
  action: string;
  email?: string | null | undefined;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  sessionId?: string | null | undefined;
}) {
  try {
    await prisma.ugcApprovalAudit.create({
      data: {
        campaignId: data.campaignId,
        mediaId: data.mediaId || null,
        action: data.action,
        email: data.email || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        sessionId: data.sessionId || null,
      },
    });
  } catch (error) {
    console.error("Failed to log approval audit", error);
  }
}

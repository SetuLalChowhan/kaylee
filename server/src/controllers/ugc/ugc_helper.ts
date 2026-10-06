import type { Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import { hashToken } from "../../utils/otp.util.js";
import { requireUserId } from "../../middlewares/auth.middleware.js";

export interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

export function appendPreviewToken(campaign: any) {
  if (!campaign) return campaign;

  const previewSecret = process.env.PREVIEW_TOKEN_SECRET || (process.env.ACCESS_TOKEN_SECRET as string);
  const previewToken = jwt.sign(
    { campaignId: campaign.id, type: "preview" },
    previewSecret,
    { expiresIn: "30d" }
  );

  const updated = { ...campaign };

  if (updated.media) {
    updated.media = updated.media.map((m: any) => ({
      ...m,
      url: `${m.url}?token=${previewToken}`,
    }));
  }

  if (updated.documents) {
    updated.documents = updated.documents.map((d: any) => ({
      ...d,
      url: `${d.url}?token=${previewToken}`,
    }));
  }

  if (updated.feedback) {
    updated.feedback = updated.feedback.map((f: any) => {
      const updatedFeedback = { ...f };
      if (f.fileUrl) {
        updatedFeedback.fileUrl = `${f.fileUrl}?token=${previewToken}`;
      }
      if (f.media) {
        updatedFeedback.media = {
          ...f.media,
          url: `${f.media.url}?token=${previewToken}`,
        };
      }
      return updatedFeedback;
    });
  }

  return updated;
}

export async function checkCampaignAccess(campaignId: string, req: Request) {
  const userId = requireUserId(req);
  const role = (req as AuthRequest).user?.role;
  const isAdmin = role === "admin";
  return prisma.ugcCampaign.findFirst({
    where: isAdmin ? { id: campaignId } : { id: campaignId, userId },
  });
}

export async function getBrandSession(req: Request, campaignId: string) {
  const sessionCookie = req.cookies[`campaign_session_${campaignId}`];
  if (!sessionCookie) return null;
  const hashedSession = hashToken(sessionCookie);
  const session = await prisma.ugcBrandSession.findFirst({
    where: {
      campaignId,
      tokenHash: hashedSession,
      expiresAt: { gt: new Date() },
      revokedAt: null,
    },
  });
  return session;
}

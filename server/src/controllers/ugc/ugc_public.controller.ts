import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { logActivity } from "../../utils/activity.util.js";
import { generateSecureToken, generateSecureOTP, hashToken } from "../../utils/otp.util.js";
import { logApprovalAudit } from "../../utils/audit.util.js";
import { sendEmail } from "../../services/email.service.js";
import { appendPreviewToken, getBrandSession } from "./ugc_helper.js";

/**
 * GET /api/ugc-campaigns/public/:slug — View public campaign
 */
export const getPublicCampaignBySlug = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };

    const campaign = await prisma.ugcCampaign.findUnique({
      where: { shareToken: slug },
      select: {
        id: true,
        name: true,
        brandName: true,
        deadline: true,
        status: true,
        releaseFiles: true,
        rating: true,
        ratingNote: true,
        createdAt: true,
        updatedAt: true,
        shareToken: true,
        shareEnabled: true,
        shareExpiresAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            slug: true,
          },
        },
        deliverables: {
          select: { id: true, text: true, progress: true, createdAt: true, updatedAt: true },
          orderBy: { createdAt: "asc" },
        },
        media: {
          select: { id: true, name: true, type: true, url: true, description: true, assetType: true, status: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        documents: {
          select: { id: true, name: true, url: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
        feedback: {
          select: {
            id: true,
            text: true,
            from: true,
            fileUrl: true,
            createdAt: true,
            media: {
              select: { id: true, name: true, type: true, url: true, createdAt: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!campaign) {
      return next(new AppError("Campaign not found", 404));
    }

    if (!campaign.shareEnabled) {
      return next(new AppError("Campaign link is disabled", 403));
    }

    if (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date()) {
      return next(new AppError("Campaign link has expired", 403));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) {
      return res.status(401).json({
        status: "auth_required",
        message: "Authentication required",
        campaignId: campaign.id,
        brandName: campaign.brandName,
      });
    }

    await logApprovalAudit({
      campaignId: campaign.id,
      action: "PAGE_VIEW",
      email: session.email,
      ipAddress: req.ip,
      sessionId: session.id,
    });

    res.status(200).json({
      status: "success",
      data: appendPreviewToken(campaign),
    });
  }
);

/**
 * POST /api/ugc-campaigns/public/:slug/opened — Mark campaign opened
 */
export const markPublicCampaignOpened = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };

    const campaign = await prisma.ugcCampaign.findUnique({
      where: { shareToken: slug },
    });

    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign link is invalid or expired", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) {
      return res.status(401).json({ status: "auth_required", message: "Authentication required" });
    }

    if (campaign.status === "Draft" || campaign.status === "Active") {
      await prisma.ugcCampaign.update({
        where: { id: campaign.id },
        data: { status: "Under Review", updatedAt: new Date() },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Campaign status updated",
    });
  }
);

/**
 * POST /api/ugc-campaigns/public/:slug/auth/otp-request — Request OTP
 */
export const requestOtpPublic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };
    const { email } = req.body as { email: string };

    if (!email) return next(new AppError("Email is required", 400));

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Invalid or expired campaign link", 403));
    }

    const otp = generateSecureOTP();
    const hash = hashToken(otp);

    // Invalidate previous active OTPs for this email and campaign
    await prisma.ugcOtp.updateMany({
      where: { campaignId: campaign.id, email, used: false },
      data: { used: true },
    });

    await prisma.ugcOtp.create({
      data: {
        campaignId: campaign.id,
        email,
        hash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        attempts: 0,
      },
    });

    const sent = await sendEmail(
      email,
      `Your OTP for ${campaign.name}`,
      `<p>Your verification code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
    );

    if (!sent) {
      await prisma.ugcOtp.updateMany({
        where: { campaignId: campaign.id, email, used: false },
        data: { used: true },
      });
      return next(
        new AppError(
          "Could not send the OTP email. Please try again later.",
          502
        )
      );
    }

    await logApprovalAudit({ campaignId: campaign.id, action: "OTP_REQUESTED", email, ipAddress: req.ip });

    res.status(200).json({ status: "success", message: "OTP sent" });
  }
);

/**
 * POST /api/ugc-campaigns/public/:slug/auth/otp-verify — Verify OTP
 */
export const verifyOtpPublic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };
    const { email, otp } = req.body as { email: string; otp: string };

    if (!email || !otp) {
      return next(new AppError("Email and OTP code are required", 400));
    }

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Invalid or expired campaign link", 403));
    }

    const otpRecord = await prisma.ugcOtp.findFirst({
      where: {
        campaignId: campaign.id,
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    if (otpRecord.attempts >= 5) {
      await prisma.ugcOtp.update({ where: { id: otpRecord.id }, data: { used: true } });
      return next(new AppError("Too many failed attempts. Please request a new OTP.", 400));
    }

    const hash = hashToken(otp.trim());
    if (otpRecord.hash !== hash) {
      const updatedAttempts = otpRecord.attempts + 1;
      await prisma.ugcOtp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: updatedAttempts,
          ...(updatedAttempts >= 5 ? { used: true } : {}),
        },
      });

      if (updatedAttempts >= 5) {
        return next(new AppError("Too many failed attempts. Please request a new OTP.", 400));
      }

      return next(new AppError(`Invalid OTP code. ${5 - updatedAttempts} attempt(s) remaining.`, 400));
    }

    await prisma.ugcOtp.update({ where: { id: otpRecord.id }, data: { used: true } });

    const sessionToken = generateSecureToken(32);
    const sessionHash = hashToken(sessionToken);

    const session = await prisma.ugcBrandSession.create({
      data: {
        campaignId: campaign.id,
        email,
        tokenHash: sessionHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await logApprovalAudit({ campaignId: campaign.id, action: "OTP_VERIFIED", email, ipAddress: req.ip });
    await logApprovalAudit({ campaignId: campaign.id, action: "SESSION_CREATED", email, ipAddress: req.ip, sessionId: session.id });

    res.cookie(`campaign_session_${campaign.id}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ status: "success", message: "Verified successfully" });
  }
);

/**
 * PATCH /api/ugc-campaigns/public/:slug/media/:mediaId/status — Approve media
 */
export const updatePublicMediaStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug, mediaId } = req.params as { slug: string; mediaId: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign not found or invalid link", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) return next(new AppError("Unauthorized", 401));

    if (mediaId === "all") {
      await prisma.ugcMedia.updateMany({
        where: { campaignId: campaign.id, status: { not: "approved" } },
        data: { status: "approved" },
      });
      await prisma.ugcCampaign.update({
        where: { id: campaign.id },
        data: { status: "Approved", updatedAt: new Date() },
      });

      logActivity({
        userId: campaign.userId,
        title: `${campaign.brandName} approved all media`,
        sub: campaign.name,
        avatarBg: "bg-green-100",
        avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
        dotColor: "bg-green-500",
        type: "APPROVAL",
        campaignId: campaign.id,
      });
      await logApprovalAudit({ campaignId: campaign.id, action: "APPROVED_ALL", email: session.email, ipAddress: req.ip, sessionId: session.id });

      return res.status(200).json({ status: "success", message: "All media items approved" });
    }

    const media = await prisma.ugcMedia.findFirst({ where: { id: mediaId, campaignId: campaign.id } });
    if (!media) return next(new AppError("Media not found or unauthorized", 404));

    if (media.status === "approved") {
      return next(new AppError("Media is already approved and cannot be changed", 400));
    }

    const updatedMedia = await prisma.ugcMedia.update({
      where: { id: mediaId },
      data: { status: "approved" },
    });

    const remainingUnapproved = await prisma.ugcMedia.count({
      where: { campaignId: campaign.id, status: { not: "approved" } },
    });
    if (remainingUnapproved === 0) {
      await prisma.ugcCampaign.update({
        where: { id: campaign.id },
        data: { status: "Approved", updatedAt: new Date() },
      });
    }

    logActivity({
      userId: campaign.userId,
      title: `${campaign.brandName} approved content`,
      sub: campaign.name,
      avatarBg: "bg-green-100",
      avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-green-500",
      type: "APPROVAL",
      campaignId: campaign.id,
    });
    await logApprovalAudit({ campaignId: campaign.id, mediaId, action: "APPROVED", email: session.email, ipAddress: req.ip, sessionId: session.id });

    res.status(200).json({ status: "success", data: updatedMedia });
  }
);

/**
 * PATCH /api/ugc-campaigns/public/:slug/media/:mediaId/request-changes — Request changes
 */
export const requestChangesPublicMedia = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug, mediaId } = req.params as { slug: string; mediaId: string };
    const { text } = req.body as { text: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign not found or invalid link", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) return next(new AppError("Unauthorized", 401));

    const media = await prisma.ugcMedia.findFirst({ where: { id: mediaId, campaignId: campaign.id } });
    if (!media) return next(new AppError("Media not found or unauthorized", 404));

    if (media.status === "approved") {
      return next(new AppError("Cannot request changes on already approved media", 400));
    }

    await prisma.ugcMedia.update({
      where: { id: mediaId },
      data: { status: "changes_requested" },
    });

    const message = await prisma.ugcFeedbackMessage.create({
      data: {
        campaignId: campaign.id,
        text,
        from: "brand",
        mediaId,
      },
      include: { media: true },
    });

    logActivity({
      userId: campaign.userId,
      title: `${campaign.brandName} requested changes`,
      sub: text.substring(0, 60),
      avatarBg: "bg-orange-100",
      avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-orange-500",
      type: "FEEDBACK",
      campaignId: campaign.id,
    });
    await logApprovalAudit({ campaignId: campaign.id, mediaId, action: "CHANGE_REQUESTED", email: session.email, ipAddress: req.ip, sessionId: session.id });

    res.status(200).json({ status: "success", data: message });
  }
);

/**
 * POST /api/ugc-campaigns/public/:slug/feedback — Submit public brand feedback
 */
export const createPublicFeedback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };
    const { text, mediaId } = req.body as { text: string; mediaId?: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign not found or invalid link", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) return next(new AppError("Unauthorized", 401));

    if (mediaId) {
      const media = await prisma.ugcMedia.findFirst({ where: { id: mediaId, campaignId: campaign.id } });
      if (!media) return next(new AppError("Media not found or unauthorized", 404));
    }

    const message = await prisma.ugcFeedbackMessage.create({
      data: {
        campaignId: campaign.id,
        text,
        from: "brand",
        mediaId: mediaId || null,
      },
      include: { media: true },
    });

    logActivity({
      userId: campaign.userId,
      title: `${campaign.brandName} left feedback`,
      sub: text.substring(0, 60),
      avatarBg: "bg-purple-100",
      avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-purple-500",
      type: "FEEDBACK",
      campaignId: campaign.id,
    });

    await logApprovalAudit({ campaignId: campaign.id, mediaId: mediaId || null, action: "FEEDBACK_SUBMITTED", email: session.email, ipAddress: req.ip, sessionId: session.id });

    res.status(201).json({ status: "success", data: message });
  }
);

/**
 * POST /api/ugc-campaigns/public/:slug/rate — Rate campaign
 */
export const rateCampaignPublic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params as { slug: string };
    const { rating, ratingNote } = req.body as { rating: number; ratingNote?: string };

    const campaign = await prisma.ugcCampaign.findUnique({ where: { shareToken: slug } });
    if (!campaign || !campaign.shareEnabled || (campaign.shareExpiresAt && new Date(campaign.shareExpiresAt) < new Date())) {
      return next(new AppError("Campaign not found or invalid link", 404));
    }

    const session = await getBrandSession(req, campaign.id);
    if (!session) return next(new AppError("Unauthorized", 401));

    const updated = await prisma.ugcCampaign.update({
      where: { id: campaign.id },
      data: { rating, ratingNote: ratingNote ?? null },
    });

    logActivity({
      userId: campaign.userId,
      title: `${campaign.brandName} rated the campaign`,
      sub: `${rating} Stars${ratingNote ? ` - ${ratingNote.substring(0, 40)}` : ""}`,
      avatarBg: "bg-yellow-100",
      avatarText: campaign.brandName.substring(0, 5).toUpperCase(),
      dotColor: "bg-yellow-500",
      type: "CAMPAIGN",
      campaignId: campaign.id,
    });

    await logApprovalAudit({
      campaignId: campaign.id,
      action: "RATING_SUBMITTED",
      email: session.email,
      ipAddress: req.ip,
      sessionId: session.id,
    });
    res.status(200).json({ status: "success", data: updated });
  }
);

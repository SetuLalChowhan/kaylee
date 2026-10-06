import express from "express";
import {
  getUgcCampaigns,
  getUgcCampaignById,
  createUgcCampaign,
  updateUgcCampaign,
  deleteUgcCampaign,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  createCampaignTask,
  updateCampaignTask,
  deleteCampaignTask,
  uploadMedia,
  replaceMedia,
  deleteMedia,
  uploadDocument,
  deleteDocument,
  createNote,
  deleteNote,
  createFeedback,
  getPublicCampaignBySlug,
  markPublicCampaignOpened,
  updatePublicMediaStatus,
  requestChangesPublicMedia,
  createPublicFeedback,
  requestOtpPublic,
  verifyOtpPublic,
  rateCampaignPublic,
  getAnalytics,
} from "../controllers/ugc_campaign.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import { rateLimitDB } from "../middlewares/rateLimit.middleware.js";
import {
  uploadCampaignFile,
  validateUploadedFiles,
} from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createUgcCampaignSchema,
  updateUgcCampaignSchema,
  createDeliverableSchema,
  updateDeliverableSchema,
  createCampaignTaskSchema,
  updateCampaignTaskSchema,
  createNoteSchema,
} from "../validations/ugc_campaign.validation.js";

const router = express.Router();

// ── Public Guest Brand Routes (Auth not required) ────────────────────────────
const publicRateLimit = rateLimitDB("public_api", 50, 15 * 60 * 1000); // 50 requests per 15 min
const otpRateLimit = rateLimitDB("otp_api", 5, 10 * 60 * 1000); // 5 requests per 10 min

router.get("/public/:slug", publicRateLimit, getPublicCampaignBySlug);
router.post("/public/:slug/opened", publicRateLimit, markPublicCampaignOpened);
router.post("/public/:slug/auth/otp-request", otpRateLimit, requestOtpPublic);
router.post("/public/:slug/auth/otp-verify", publicRateLimit, verifyOtpPublic);

router.patch("/public/:slug/media/:mediaId/status", publicRateLimit, updatePublicMediaStatus);
router.post("/public/:slug/media/:mediaId/request-changes", publicRateLimit, requestChangesPublicMedia);
router.post("/public/:slug/feedback", publicRateLimit, createPublicFeedback);
router.post("/public/:slug/rate", publicRateLimit, rateCampaignPublic);

// ── Creator Routes (Auth Guard Required) ─────────────────────────────────────
router.use(authGuard);

router.get("/", getUgcCampaigns);
router.get("/analytics", getAnalytics);
router.get("/:id", getUgcCampaignById);
router.post("/", validate(createUgcCampaignSchema), createUgcCampaign);
router.patch("/:id", validate(updateUgcCampaignSchema), updateUgcCampaign);
router.delete("/:id", deleteUgcCampaign);

// Deliverables
router.post("/:campaignId/deliverables", validate(createDeliverableSchema), createDeliverable);
router.patch("/:campaignId/deliverables/:id", validate(updateDeliverableSchema), updateDeliverable);
router.delete("/:campaignId/deliverables/:id", deleteDeliverable);

// Tasks
router.post("/:campaignId/tasks", validate(createCampaignTaskSchema), createCampaignTask);
router.patch("/:campaignId/tasks/:id", validate(updateCampaignTaskSchema), updateCampaignTask);
router.delete("/:campaignId/tasks/:id", deleteCampaignTask);

// Media Upload
router.post(
  "/:campaignId/media",
  uploadCampaignFile.single("file"),
  validateUploadedFiles("campaign"),
  uploadMedia
);
router.patch(
  "/:campaignId/media/:id/replace",
  uploadCampaignFile.single("file"),
  validateUploadedFiles("campaign"),
  replaceMedia
);
router.delete("/:campaignId/media/:id", deleteMedia);

// Documents Upload
router.post(
  "/:campaignId/documents",
  uploadCampaignFile.single("file"),
  validateUploadedFiles("campaign"),
  uploadDocument
);
router.delete("/:campaignId/documents/:id", deleteDocument);

// Notes
router.post("/:campaignId/notes", validate(createNoteSchema), createNote);
router.delete("/:campaignId/notes/:id", deleteNote);

// Feedback with optional file resolution
router.post(
  "/:campaignId/feedback",
  uploadCampaignFile.single("file"),
  validateUploadedFiles("campaign"),
  createFeedback
);

export default router;

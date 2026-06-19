import express from "express";
import {
  getUgcCampaigns,
  getUgcCampaignById,
  createUgcCampaign,
  updateUgcCampaign,
  deleteUgcCampaign,
  createDeliverable,
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
  updatePublicMediaStatus,
  requestChangesPublicMedia,
  createPublicFeedback,
} from "../controllers/ugc_campaign.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import { uploadCampaignFile } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createUgcCampaignSchema,
  updateUgcCampaignSchema,
  createDeliverableSchema,
  createCampaignTaskSchema,
  updateCampaignTaskSchema,
  createNoteSchema,
} from "../validations/ugc_campaign.validation.js";

const router = express.Router();

// ── Public Guest Brand Routes (Auth not required) ────────────────────────────
router.get("/public/:slug", getPublicCampaignBySlug);
router.patch("/public/:slug/media/:mediaId/status", updatePublicMediaStatus);
router.post("/public/:slug/media/:mediaId/request-changes", requestChangesPublicMedia);
router.post("/public/:slug/feedback", createPublicFeedback);

// ── Creator Routes (Auth Guard Required) ─────────────────────────────────────
router.use(authGuard);

router.get("/", getUgcCampaigns);
router.get("/:id", getUgcCampaignById);
router.post("/", validate(createUgcCampaignSchema), createUgcCampaign);
router.patch("/:id", validate(updateUgcCampaignSchema), updateUgcCampaign);
router.delete("/:id", deleteUgcCampaign);

// Deliverables
router.post("/:campaignId/deliverables", validate(createDeliverableSchema), createDeliverable);
router.delete("/:campaignId/deliverables/:id", deleteDeliverable);

// Tasks
router.post("/:campaignId/tasks", validate(createCampaignTaskSchema), createCampaignTask);
router.patch("/:campaignId/tasks/:id", validate(updateCampaignTaskSchema), updateCampaignTask);
router.delete("/:campaignId/tasks/:id", deleteCampaignTask);

// Media Upload
router.post("/:campaignId/media", uploadCampaignFile.single("file"), uploadMedia);
router.patch("/:campaignId/media/:id/replace", uploadCampaignFile.single("file"), replaceMedia);
router.delete("/:campaignId/media/:id", deleteMedia);

// Documents Upload
router.post("/:campaignId/documents", uploadCampaignFile.single("file"), uploadDocument);
router.delete("/:campaignId/documents/:id", deleteDocument);

// Notes
router.post("/:campaignId/notes", validate(createNoteSchema), createNote);
router.delete("/:campaignId/notes/:id", deleteNote);

// Feedback with optional file resolution
router.post("/:campaignId/feedback", uploadCampaignFile.single("file"), createFeedback);

export default router;

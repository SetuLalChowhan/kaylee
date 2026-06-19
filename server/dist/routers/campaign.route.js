import express from "express";
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign, } from "../controllers/campaign.controller.js";
import { authGuard, adminGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCampaignSchema, updateCampaignSchema } from "../validations/campaign.validation.js";
const router = express.Router();
// GET /api/campaign is accessible to all logged-in users to populate the dropdown
router.get("/", authGuard, getCampaigns);
// POST, PATCH, and DELETE are restricted to Admin users
router.post("/", authGuard, adminGuard, validate(createCampaignSchema), createCampaign);
router.patch("/:id", authGuard, adminGuard, validate(updateCampaignSchema), updateCampaign);
router.delete("/:id", authGuard, adminGuard, deleteCampaign);
export default router;
//# sourceMappingURL=campaign.route.js.map
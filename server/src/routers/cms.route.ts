import express from "express";
import { getCmsContent, updateCmsContent } from "../controllers/cms.controller.js";
import { authGuard, adminGuard } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getCmsContent);
router.put("/", authGuard, adminGuard, updateCmsContent);

export default router;

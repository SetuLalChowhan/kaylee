import express from "express";
import { getUserActivities, createActivity } from "../controllers/activity.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authGuard);

router.get("/", getUserActivities);
router.post("/", createActivity);

export default router;

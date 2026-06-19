import express from "express";
import {
  getMyNotifications,
  markAsSeen,
  markAllAsSeen,
  deleteNotification
} from "../controllers/notification.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All notification routes require authentication
router.use(authGuard);

router.get("/", getMyNotifications);
router.patch("/seen-all", markAllAsSeen);
router.patch("/:id/seen", markAsSeen);
router.delete("/:id", deleteNotification);

export default router;

import express from "express";
import { getMe, updateProfile, changePassword, completeOnboarding } from "../controllers/user.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateProfileSchema, changePasswordSchema, onboardingSchema } from "../validations/user.validation.js";

const router = express.Router();

// Apply authGuard to all user routes
router.use(authGuard);

router.get("/me", getMe);
router.patch(
  "/update",
  uploadAvatar.fields([
    { name: "avatar", maxCount: 1 },
    { name: "brandLogos", maxCount: 10 },
  ]),
  validate(updateProfileSchema),
  updateProfile,
);
router.patch("/change-password", validate(changePasswordSchema), changePassword);
router.put("/onboarding", uploadAvatar.single("avatar"), validate(onboardingSchema), completeOnboarding);

export default router;
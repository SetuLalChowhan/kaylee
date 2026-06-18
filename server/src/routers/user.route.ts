import express from "express";
import { getMe, updateProfile, changePassword } from "../controllers/user.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateProfileSchema, changePasswordSchema } from "../validations/user.validation.js";

const router = express.Router();

// Apply authGuard to all user routes
router.use(authGuard);

router.get("/me", getMe);
router.patch("/update", upload.single("avatar"), validate(updateProfileSchema), updateProfile);
router.patch("/change-password", validate(changePasswordSchema), changePassword);

export default router;
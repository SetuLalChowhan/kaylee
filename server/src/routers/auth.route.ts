import express from "express";
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resendVerificationLink,
  resendForgotPasswordLink,
  resetPassword,
  refreshTokenHandler,
  logout,
  googleLogin,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyEmailSchema,
  resetPasswordSchema,
} from "../validations/user.validation.js";

import {
  authLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/google-login", authLimiter, googleLogin);
router.post("/forgot-password", passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/resend-verification-link", passwordResetLimiter, validate(forgotPasswordSchema), resendVerificationLink);
router.post("/resend-forgot-link", passwordResetLimiter, validate(forgotPasswordSchema), resendForgotPasswordLink);
router.post("/reset-password", passwordResetLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", logout);

export default router;
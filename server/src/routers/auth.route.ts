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

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/google-login", googleLogin);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/resend-verification-link", validate(forgotPasswordSchema), resendVerificationLink);
router.post("/resend-forgot-link", validate(forgotPasswordSchema), resendForgotPasswordLink);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", logout);

export default router;
import express from "express";
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resendOtp,
  resendVerificationOtp,
  resendForgotOtp,
  resetPassword,
  verifyResetOtp,
  refreshTokenHandler,
  logout,
  googleLogin,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../validations/user.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/verify-email", validate(verifyOtpSchema), verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/google-login", googleLogin);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/verify-reset-otp", validate(verifyOtpSchema), verifyResetOtp);
router.post("/resend-otp", resendOtp); // Resend OTP usually just needs email, can use verifyOtpSchema with optional OTP or dedicated one
router.post("/resend-verification-otp", resendVerificationOtp);
router.post("/resend-forgot-otp", resendForgotOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", logout);

export default router;
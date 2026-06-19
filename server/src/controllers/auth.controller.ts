import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  generateResetToken,
} from "../utils/auth.util.js";
import { sendEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError("User already exists!", 400));
    }

    const hashedPassword = await hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        verificationOtp: otp,
        otpExpires,
      },
    });

    await sendEmail(
      email,
      "Verify your account",
      `<h1>Your OTP is: ${otp}</h1>`,
    );

    res.status(201).json({
      status: "success",
      message: "Registration successful! Please check your email for OTP.",
      userId: newUser.id,
    });
  },
);

export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.verificationOtp !== otp) {
      return next(new AppError("Invalid OTP", 400));
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
      return next(new AppError("OTP has expired", 400));
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isVerified: true, verificationOtp: null, otpExpires: null },
    });

    const accessToken = generateAccessToken({ userId: updatedUser.id });
    const refreshToken = generateRefreshToken({ userId: updatedUser.id });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Email verified successfully!",
      accessToken,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return next(new AppError("User not found!", 404));
    if (!user.isVerified)
      return next(new AppError("Please verify your email first!", 401));

    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch)
      return next(new AppError("Invalid credentials!", 401));

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  },
);
export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { idToken } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return next(
        new AppError("Google Client ID is not configured on the server", 500),
      );
    }

    if (!idToken) {
      return next(new AppError("Google ID Token is required", 400));
    }

    // Verify Google ID Token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
    } catch (err) {
      return next(new AppError("Invalid Google Token", 401));
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next(new AppError("Google authentication failed", 400));
    }

    const { email, name, picture, given_name, family_name } = payload;

    // Check database for existing user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName: given_name || name?.split(" ")[0] || "Google",
          lastName:
            family_name || name?.split(" ").slice(1).join(" ") || "User",
          email,
          password: "", // Empty password for OAuth users
          isVerified: true, // Google accounts are pre-verified
          avatar: picture || null,
        },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Set Refresh Token in Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      message: "Google login successful",
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return next(new AppError("User not found with this email!", 404));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { verificationOtp: otp, otpExpires },
    });

    await sendEmail(
      email,
      "Password Reset OTP",
      `<h1>Your Reset OTP is: ${otp}</h1>`,
    );

    res
      .status(200)
      .json({ status: "success", message: "Reset OTP sent to your email." });
  },
);

export const resendOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, type } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new AppError("User not found!", 404));

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { verificationOtp: otp, otpExpires },
    });

    const subject =
      type === "FORGOT_PASSWORD"
        ? "Password Reset OTP"
        : "Account Verification OTP";
    const message = `<h1>Your OTP is: ${otp}</h1><p>This code will expire in 10 minutes.</p>`;

    await sendEmail(email, subject, message);

    res.status(200).json({
      status: "success",
      message: `A new ${type.toLowerCase().replace("_", " ")} OTP has been sent.`,
    });
  },
);

export const verifyResetOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.verificationOtp !== otp)
      return next(new AppError("Invalid OTP", 400));
    if (user.otpExpires && new Date() > user.otpExpires)
      return next(new AppError("OTP has expired", 400));

    const resetToken = generateResetToken({ userId: user.id });

    await prisma.user.update({
      where: { email },
      data: { verificationOtp: null, otpExpires: null },
    });

    res.status(200).json({
      status: "success",
      message: "OTP verified. You can now reset your password.",
      resetToken,
    });
  },
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resetToken, newPassword } = req.body;

    let decoded: any;
    try {
      decoded = jwt.verify(
        resetToken,
        process.env.RESET_TOKEN_SECRET as string,
      );
    } catch (err) {
      return next(new AppError("Invalid or expired reset token", 400));
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword, isVerified: true },
    });

    res
      .status(200)
      .json({
        status: "success",
        message: "Password reset successful! You can now login.",
      });
  },
);

export const refreshTokenHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return next(new AppError("Refresh Token not found!", 401));

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      (err: any, decoded: any) => {
        if (err)
          return next(new AppError("Invalid or Expired Refresh Token", 403));
        const accessToken = generateAccessToken({ userId: decoded.userId });
        res.status(200).json({ status: "success", accessToken });
      },
    );
  },
);

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
});

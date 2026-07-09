import prisma from "../config/db.js";
import { comparePassword, generateAccessToken, generateRefreshToken, hashPassword, generateResetToken, } from "../utils/auth.util.js";
import { sendEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const register = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return next(new AppError("User already exists!", 400));
    }
    const hashedPassword = await hashPassword(password);
    const token = crypto.randomBytes(32).toString("hex");
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const newUser = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            verificationOtp: token,
            otpExpires,
        },
    });
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationLink = `${clientUrl}/verify-email?token=${token}`;
    await sendEmail(email, "Verify your account", `<h1>Verify Your Email</h1>
       <p>Thank you for registering at STAKD! Please click the link below to verify your email address:</p>
       <p><a href="${verificationLink}" style="background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Verify Email</a></p>
       <p>If the button doesn't work, copy and paste this link in your browser:</p>
       <p><a href="${verificationLink}">${verificationLink}</a></p>
       <p>This verification link will expire in 24 hours.</p>`, "hello");
    res.status(201).json({
        status: "success",
        message: "Registration successful! Please check your email for the verification link.",
        userId: newUser.id,
    });
});
export const verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.body;
    if (!token) {
        return next(new AppError("Verification token is required", 400));
    }
    const user = await prisma.user.findFirst({
        where: { verificationOtp: token },
    });
    if (!user) {
        return next(new AppError("Invalid or expired verification link", 400));
    }
    if (user.otpExpires && new Date() > user.otpExpires) {
        return next(new AppError("Verification link has expired", 400));
    }
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationOtp: null, otpExpires: null },
    });
    const accessToken = generateAccessToken({ userId: updatedUser.id, role: updatedUser.role });
    const refreshToken = generateRefreshToken({ userId: updatedUser.id, role: updatedUser.role });
    const isSecureCookie = process.env.NODE_ENV === "production" || !req.get("host")?.includes("localhost");
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: isSecureCookie ? "none" : "lax",
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
            role: updatedUser.role,
            displayName: updatedUser.displayName,
            slug: updatedUser.slug,
        },
    });
});
export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return next(new AppError("User not found!", 404));
    if (!user.isVerified)
        return next(new AppError("Please verify your email first!", 401));
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch)
        return next(new AppError("Invalid credentials!", 401));
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
    const isSecureCookie = process.env.NODE_ENV === "production" || !req.get("host")?.includes("localhost");
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: isSecureCookie ? "none" : "lax",
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
            role: user.role,
            displayName: user.displayName,
            slug: user.slug,
        },
    });
});
export const googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId) {
            return next(new AppError("Google Client ID is not configured on the server", 500));
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
        }
        catch (err) {
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
                    lastName: family_name || name?.split(" ").slice(1).join(" ") || "User",
                    email,
                    password: "", // Empty password for OAuth users
                    isVerified: true, // Google accounts are pre-verified
                    avatar: picture || null,
                },
            });
        }
        const accessToken = generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
        const isSecureCookie = process.env.NODE_ENV === "production" || !req.get("host")?.includes("localhost");
        // Set Refresh Token in Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isSecureCookie,
            sameSite: isSecureCookie ? "none" : "lax",
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
                role: user.role,
                displayName: user.displayName,
                slug: user.slug,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return next(new AppError("User not found with this email!", 404));
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await prisma.user.update({
        where: { email },
        data: { verificationOtp: token, otpExpires: tokenExpires },
    });
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetLink = `${clientUrl}/reset-password?token=${token}`;
    await sendEmail(email, "Password Reset Link", `<h1>Reset Your Password</h1>
       <p>Please click the link below to reset your password:</p>
       <p><a href="${resetLink}" style="background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Reset Password</a></p>
       <p>If the button doesn't work, copy and paste this link in your browser:</p>
       <p><a href="${resetLink}">${resetLink}</a></p>
       <p>This reset link will expire in 1 hour.</p>`, "hello");
    res.status(200).json({
        status: "success",
        message: "A password reset link has been sent to your email.",
    });
});
export const resendOtp = catchAsync(async (req, res, next) => {
    const { email, type } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return next(new AppError("User not found!", 404));
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
        where: { email },
        data: { verificationOtp: otp, otpExpires },
    });
    const subject = type === "FORGOT_PASSWORD"
        ? "Password Reset OTP"
        : "Account Verification OTP";
    const message = `<h1>Your OTP is: ${otp}</h1><p>This code will expire in 10 minutes.</p>`;
    await sendEmail(email, subject, message);
    res.status(200).json({
        status: "success",
        message: `A new ${type.toLowerCase().replace("_", " ")} OTP has been sent.`,
    });
});
export const resendVerificationOtp = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return next(new AppError("User not found!", 404));
    if (user.isVerified) {
        return res.status(400).json({
            status: "fail",
            message: "Email is already verified",
        });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await prisma.user.update({
        where: { email },
        data: { verificationOtp: token, otpExpires },
    });
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationLink = `${clientUrl}/verify-email?token=${token}`;
    await sendEmail(email, "Account Verification", `<h1>Verify Your Email</h1>
       <p>Please click the link below to verify your account:</p>
       <p><a href="${verificationLink}" style="background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Verify Email</a></p>
       <p>If the button doesn't work, copy and paste this link in your browser:</p>
       <p><a href="${verificationLink}">${verificationLink}</a></p>
       <p>This verification link will expire in 24 hours.</p>`, "hello");
    res.status(200).json({
        status: "success",
        message: "A new verification link has been sent to your email.",
    });
});
export const resendForgotOtp = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return next(new AppError("User not found!", 404));
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await prisma.user.update({
        where: { email },
        data: { verificationOtp: token, otpExpires: tokenExpires },
    });
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetLink = `${clientUrl}/reset-password?token=${token}`;
    await sendEmail(email, "Password Reset Link", `<h1>Reset Your Password</h1>
       <p>Please click the link below to reset your password:</p>
       <p><a href="${resetLink}" style="background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Reset Password</a></p>
       <p>If the button doesn't work, copy and paste this link in your browser:</p>
       <p><a href="${resetLink}">${resetLink}</a></p>
       <p>This reset link will expire in 1 hour.</p>`, "hello");
    res.status(200).json({
        status: "success",
        message: "A new password reset link has been sent.",
    });
});
export const verifyResetOtp = catchAsync(async (req, res, next) => {
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
});
export const resetPassword = catchAsync(async (req, res, next) => {
    const { token, resetToken, newPassword } = req.body;
    let userId;
    if (token) {
        const user = await prisma.user.findFirst({
            where: { verificationOtp: token },
        });
        if (!user) {
            return next(new AppError("Invalid or expired reset link", 400));
        }
        if (user.otpExpires && new Date() > user.otpExpires) {
            return next(new AppError("Reset link has expired", 400));
        }
        userId = user.id;
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationOtp: null, otpExpires: null },
        });
    }
    else {
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
            userId = decoded.userId;
        }
        catch (err) {
            return next(new AppError("Invalid or expired reset token", 400));
        }
    }
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword, isVerified: true },
    });
    res
        .status(200)
        .json({
        status: "success",
        message: "Password reset successful! You can now login.",
    });
});
export const refreshTokenHandler = catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return next(new AppError("Refresh Token not found!", 401));
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true },
        });
        if (!user) {
            return next(new AppError("User not found", 404));
        }
        const accessToken = generateAccessToken({ userId: decoded.userId, role: user.role });
        res.status(200).json({ status: "success", accessToken });
    }
    catch (err) {
        return next(new AppError("Invalid or Expired Refresh Token", 403));
    }
});
export const logout = catchAsync(async (req, res) => {
    const isSecureCookie = process.env.NODE_ENV === "production" || !req.get("host")?.includes("localhost");
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isSecureCookie,
        sameSite: isSecureCookie ? "none" : "lax",
    });
    res
        .status(200)
        .json({ status: "success", message: "Logged out successfully" });
});
//# sourceMappingURL=auth.controller.js.map
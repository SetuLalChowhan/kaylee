import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";

// Global limiter: 300 requests per minute
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests, please try again after a minute.",
  },
});

// Auth endpoints limiter (login, register, google-login): 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many authentication attempts, please try again in 15 minutes.",
  },
});

// Password reset / resend verification limiter: 5 requests per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests, please try again in an hour.",
  },
});

// Contact form limiter: 5 requests per hour
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many contact messages sent. Please try again in an hour.",
  },
});

// DB-backed rate limiter
export const rateLimitDB = (
  prefix: string,
  limit: number,
  windowMs: number
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const key = `${prefix}:${ip}`;
      const now = new Date();

      let record = await prisma.ugcRateLimit.findUnique({
        where: { key },
      });

      if (!record || record.expireAt < now) {
        if (record) {
          await prisma.ugcRateLimit.update({
            where: { key },
            data: { points: 1, expireAt: new Date(now.getTime() + windowMs) },
          });
        } else {
          await prisma.ugcRateLimit.create({
            data: { key, points: 1, expireAt: new Date(now.getTime() + windowMs) },
          });
        }
        return next();
      }

      if (record.points >= limit) {
        return next(new AppError("Too many requests, please try again later.", 429));
      }

      await prisma.ugcRateLimit.update({
        where: { key },
        data: { points: { increment: 1 } },
      });

      next();
    } catch {
      next();
    }
  };
};

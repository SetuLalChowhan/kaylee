import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export const rateLimitDB = (
  prefix: string,
  limit: number,
  windowMs: number
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (err) {
      // Fail open on rate limiting error to not block production flow if DB has transient issue, 
      // or you could choose to fail closed. Failing open is typically safer for business logic.
      next();
    }
  };
};

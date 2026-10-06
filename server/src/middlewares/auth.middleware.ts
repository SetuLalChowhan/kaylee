import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";

export interface JwtPayload {
  userId: string;
  role: string;
  type?: string;
  iat: number;
  exp: number;
}

export const requireUserId = (req: Request): string => {
  const user = (req as any).user;
  if (!user || typeof user.userId !== "string" || user.userId.trim() === "" || user.type === "preview") {
    throw new AppError("Authentication required. Invalid user session.", 401);
  }
  return user.userId;
};

export const authGuard = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    next(new AppError("You are not logged in. Please log in to get access.", 401));
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded: any) => {
    if (err || !decoded || typeof decoded.userId !== "string" || decoded.userId.trim() === "" || decoded.type === "preview") {
      next(new AppError("Invalid or expired token. Please log in again.", 401));
      return;
    }
    (req as Request & { user: JwtPayload }).user = decoded as JwtPayload;
    next();
  });
};

export const adminGuard = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const userId = requireUserId(req);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "admin") {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }

  next();
});
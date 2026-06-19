import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const authGuard = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    next(new AppError("You are not logged in. Please log in to get access.", 401));
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
    if (err) {
      next(new AppError("Invalid or expired token. Please log in again.", 401));
      return;
    }
    (req as Request & { user: JwtPayload }).user = decoded as JwtPayload;
    next();
  });
};

export const adminGuard = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const { userId } = (req as Request & { user: { userId: string } }).user;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "admin") {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }

  next();
});
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
export const authGuard = (req, _res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) {
        next(new AppError("You are not logged in. Please log in to get access.", 401));
        return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            next(new AppError("Invalid or expired token. Please log in again.", 403));
            return;
        }
        req.user = decoded;
        next();
    });
};
export const adminGuard = catchAsync(async (req, _res, next) => {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    if (!user || user.role !== "admin") {
        return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
});
//# sourceMappingURL=auth.middleware.js.map
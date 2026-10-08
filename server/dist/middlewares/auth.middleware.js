import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
export const requireUserId = (req) => {
    const user = req.user;
    if (!user || user.type === "preview") {
        throw new AppError("Authentication required. Invalid user session.", 401);
    }
    const id = user.userId || user.id || user._id;
    if (typeof id !== "string" || id.trim() === "") {
        throw new AppError("Authentication required. Invalid user session.", 401);
    }
    return id;
};
export const authGuard = (req, _res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) {
        next(new AppError("You are not logged in. Please log in to get access.", 401));
        return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err || !decoded || typeof decoded.userId !== "string" || decoded.userId.trim() === "" || decoded.type === "preview") {
            next(new AppError("Invalid or expired token. Please log in again.", 401));
            return;
        }
        req.user = decoded;
        next();
    });
};
export const adminGuard = catchAsync(async (req, _res, next) => {
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
//# sourceMappingURL=auth.middleware.js.map
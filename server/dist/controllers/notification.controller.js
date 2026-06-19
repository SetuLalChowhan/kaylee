import prisma from "../config/db.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
export const getMyNotifications = catchAsync(async (req, res) => {
    const { userId } = req.user;
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
    res.status(200).json({
        status: "success",
        data: notifications
    });
});
export const markAsSeen = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const id = req.params.id;
    const notification = await prisma.notification.findFirst({
        where: { id, userId }
    });
    if (!notification)
        return next(new AppError("Notification not found", 404));
    const updated = await prisma.notification.update({
        where: { id },
        data: { isSeen: true }
    });
    res.status(200).json({
        status: "success",
        message: "Notification marked as seen",
        data: updated
    });
});
export const markAllAsSeen = catchAsync(async (req, res) => {
    const { userId } = req.user;
    await prisma.notification.updateMany({
        where: { userId, isSeen: false },
        data: { isSeen: true }
    });
    res.status(200).json({
        status: "success",
        message: "All notifications marked as seen"
    });
});
export const deleteNotification = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const id = req.params.id;
    const notification = await prisma.notification.findFirst({
        where: { id, userId }
    });
    if (!notification)
        return next(new AppError("Notification not found", 404));
    await prisma.notification.delete({
        where: { id }
    });
    res.status(200).json({
        status: "success",
        message: "Notification deleted successfully"
    });
});
//# sourceMappingURL=notification.controller.js.map
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
export const downloadInterceptor = async (req, res, next) => {
    const { filename } = req.params;
    try {
        const campaignMedia = (await prisma.ugcMedia.findFirst({
            where: { url: { contains: filename } },
            include: { campaign: true },
        }));
        const campaignDoc = !campaignMedia
            ? (await prisma.ugcDocument.findFirst({
                where: { url: { contains: filename } },
                include: { campaign: true },
            }))
            : null;
        const campaign = campaignMedia?.campaign || campaignDoc?.campaign;
        if (!campaign || campaign.releaseFiles === true) {
            return next();
        }
        // Check if the request is loaded inside our app (e.g. preview)
        const referer = req.headers.referer;
        const origin = req.headers.origin;
        const allowedHosts = [
            "localhost:5173",
            "localhost:5174",
            "stackd12.netlify.app",
            "stackdadmin.netlify.app",
            "stakd-client.vercel.app",
            "stakd-admin.vercel.app",
            "softvencealpha.com",
            "admin.getstakd.co",
            "getstakd.co",
            "api.getstakd.co",
        ];
        const isFromOurApp = (referer && allowedHosts.some(host => referer.includes(host))) ||
            (origin && allowedHosts.some(host => origin.includes(host)));
        if (isFromOurApp) {
            return next();
        }
        const authHeader = req.headers.authorization;
        let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        if (!token && req.query.token) {
            token = req.query.token;
        }
        if (!token) {
            return res.status(403).json({
                status: "fail",
                message: "Access forbidden. Downloads are locked for this campaign.",
            });
        }
        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            return next();
        }
        catch (err) {
            return res.status(403).json({
                status: "fail",
                message: "Access forbidden. Invalid token.",
            });
        }
    }
    catch (err) {
        return next(err);
    }
};
//# sourceMappingURL=download.middleware.js.map
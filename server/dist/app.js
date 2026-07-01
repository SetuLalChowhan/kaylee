import express from "express";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import { jsonParserBypassWebhook, urlencodedParserBypassWebhook } from "./middlewares/parser.middleware.js";
import authRoutes from "./routers/auth.route.js";
import userRoutes from "./routers/user.route.js";
import invoiceRoutes from "./routers/invoice.route.js";
import campaignRoutes from "./routers/campaign.route.js";
import plannerRoutes from "./routers/planner.route.js";
import ugcCampaignRoutes from "./routers/ugc_campaign.route.js";
import faqRoutes from "./routers/faq.route.js";
import notificationRoutes from "./routers/notification.route.js";
import cmsRoutes from "./routers/cms.route.js";
import planRoutes from "./routers/plan.route.js";
import subscriptionRoutes from "./routers/subscription.route.js";
import contactRoutes from "./routers/contact.route.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/AppError.js";
import { downloadInterceptor } from "./middlewares/download.middleware.js";
const app = express();
// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(jsonParserBypassWebhook);
app.use(urlencodedParserBypassWebhook);
app.use(cookieParser());
// ── Custom Static Interceptor (campaign download locking) ─────────────────────
app.get("/uploads/campaigns/:filename", downloadInterceptor);
// ── Static Files (uploaded avatars) ──────────────────────────────────────────
app.use("/uploads", express.static("uploads"));
// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/ugc-campaigns", ugcCampaignRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/contact", contactRoutes);
// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map
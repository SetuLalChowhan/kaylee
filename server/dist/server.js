import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import authRoutes from "./routers/auth.route.js";
import userRoutes from "./routers/user.route.js";
import invoiceRoutes from "./routers/invoice.route.js";
import campaignRoutes from "./routers/campaign.route.js";
import plannerRoutes from "./routers/planner.route.js";
import ugcCampaignRoutes from "./routers/ugc_campaign.route.js";
import faqRoutes from "./routers/faq.route.js";
import notificationRoutes from "./routers/notification.route.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/AppError.js";
import prisma from "./config/db.js";
import { runSeeds } from "./seeds/index.js";
const app = express();
const PORT = process.env.PORT || 3000;
// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// ── Static Files (uploaded avatars) ──────────────────────────────────────────
app.use("/uploads", express.static("uploads"));
// ── API Documentation ─────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(globalErrorHandler);
// ── Database Auto-seeding ─────────────────────────────────────────────────────
runSeeds();
app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
    console.log(`API Docs      → http://localhost:${PORT}/api-docs`);
});
//# sourceMappingURL=server.js.map
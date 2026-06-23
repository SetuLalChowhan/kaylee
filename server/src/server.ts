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
import cmsRoutes from "./routers/cms.route.js";
import planRoutes from "./routers/plan.route.js";
import subscriptionRoutes from "./routers/subscription.route.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/AppError.js";
import prisma from "./config/db.js";
import { runSeeds } from "./seeds/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ── Core Middleware ───────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  process.env.ADMIN_URL || "http://localhost:5174",
  "https://radiant-lolly-c00349.netlify.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
// Bypasses global parsing for Stripe webhook to preserve raw body signature
app.use((req, res, next) => {
  if (req.originalUrl === "/api/subscriptions/webhook") {
    next();
  } else {
    express.json({ limit: "10kb" })(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.originalUrl === "/api/subscriptions/webhook") {
    next();
  } else {
    express.urlencoded({ extended: true, limit: "10kb" })(req, res, next);
  }
});
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
app.use("/api/cms", cmsRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(globalErrorHandler);

// ── Standalone Mode Setup (Local / Non-Serverless) ────────────────────────────
if (!process.env.VERCEL) {
  // ── Database Auto-seeding ─────────────────────────────────────────────────────
  runSeeds();

  app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
    console.log(`API Docs      → http://localhost:${PORT}/api-docs`);
  });
}

export default app;

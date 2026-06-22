import express, { Router } from "express";
import { createCheckoutSession, verifySession, getMyPlan, handleWebhook, cancelSubscription, getMyPayments, adminGetPayments, adminCancelPurchase, } from "../controllers/subscription.controller.js";
import { authGuard, adminGuard } from "../middlewares/auth.middleware.js";
const router = Router();
// Stripe Webhook Endpoint (Receives raw body stream directly from Stripe, no user authGuard)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);
// All other subscription routes require the user to be logged in
router.post("/checkout", authGuard, createCheckoutSession);
router.post("/verify", authGuard, verifySession);
router.get("/my-plan", authGuard, getMyPlan);
router.post("/cancel", authGuard, cancelSubscription);
router.get("/my-payments", authGuard, getMyPayments);
// Admin-only subscription and payment routes
router.get("/admin/payments", authGuard, adminGuard, adminGetPayments);
router.post("/admin/cancel", authGuard, adminGuard, adminCancelPurchase);
export default router;
//# sourceMappingURL=subscription.route.js.map
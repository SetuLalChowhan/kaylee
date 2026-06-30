import express from "express";
import { getMe, updateProfile, changePassword, completeOnboarding, deleteBrandLogo, updateNotificationSettings, getDashboardStats, deleteAccount, adminGetAllUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from "../controllers/user.controller.js";
import { createPortfolioItem, getPortfolioItems, updatePortfolioItem, deletePortfolioItem, getPublicPortfolio, } from "../controllers/portfolio.controller.js";
import { authGuard, adminGuard } from "../middlewares/auth.middleware.js";
import { uploadAvatar, uploadPortfolio } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateProfileSchema, changePasswordSchema, onboardingSchema } from "../validations/user.validation.js";
import { createPortfolioSchema, updatePortfolioSchema } from "../validations/portfolio.validation.js";
const router = express.Router();
// ── Public Routes ─────────────────────────────────────────────────────────────
router.get("/portfolio-preview/:slug", getPublicPortfolio);
// ── Protected Routes (Auth Required) ──────────────────────────────────────────
router.use(authGuard);
router.get("/me", getMe);
router.get("/dashboard-stats", getDashboardStats);
router.patch("/update", uploadAvatar.fields([
    { name: "avatar", maxCount: 1 },
    { name: "brandLogos", maxCount: 10 },
]), validate(updateProfileSchema), updateProfile);
router.patch("/change-password", validate(changePasswordSchema), changePassword);
router.put("/onboarding", uploadAvatar.single("avatar"), validate(onboardingSchema), completeOnboarding);
router.delete("/brand-logo", deleteBrandLogo);
router.patch("/notification-settings", updateNotificationSettings);
router.delete("/delete-account", deleteAccount);
// ── Portfolio CRUD ─────────────────────────────────────────────────────────────
router.post("/portfolio", uploadPortfolio.single("file"), validate(createPortfolioSchema), createPortfolioItem);
router.get("/portfolio", getPortfolioItems);
router.patch("/portfolio/:id", uploadPortfolio.single("file"), validate(updatePortfolioSchema), updatePortfolioItem);
router.delete("/portfolio/:id", deletePortfolioItem);
// ── Admin User CRUD ───────────────────────────────────────────────────────────
router.get("/admin/users", adminGuard, adminGetAllUsers);
router.post("/admin/users", adminGuard, adminCreateUser);
router.patch("/admin/users/:id", adminGuard, adminUpdateUser);
router.delete("/admin/users/:id", adminGuard, adminDeleteUser);
export default router;
//# sourceMappingURL=user.route.js.map
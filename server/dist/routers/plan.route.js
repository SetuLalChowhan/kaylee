import { Router } from "express";
import { getPlans, createPlan, updatePlan, deletePlan } from "../controllers/plan.controller.js";
import { authGuard, adminGuard } from "../middlewares/auth.middleware.js";
const router = Router();
// Public route to retrieve pricing tiers
router.get("/", getPlans);
// Admin-only CRUD actions
router.post("/", authGuard, adminGuard, createPlan);
router.patch("/:id", authGuard, adminGuard, updatePlan);
router.delete("/:id", authGuard, adminGuard, deletePlan);
export default router;
//# sourceMappingURL=plan.route.js.map
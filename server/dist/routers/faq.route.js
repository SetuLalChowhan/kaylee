import express from "express";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "../controllers/faq.controller.js";
import { authGuard, adminGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { faqSchema } from "../validations/faq.validation.js";
const router = express.Router();
// Public route to view FAQs
router.get("/", getFaqs);
// Protected routes (requires Admin role)
router.use(authGuard);
router.use(adminGuard);
router.post("/", validate(faqSchema), createFaq);
router.put("/:id", validate(faqSchema), updateFaq);
router.delete("/:id", deleteFaq);
export default router;
//# sourceMappingURL=faq.route.js.map
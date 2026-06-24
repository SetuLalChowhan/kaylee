import express from "express";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/contact.controller.js";
import { authGuard, adminGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../validations/contact.validation.js";

const router = express.Router();

// Public route to submit a contact message
router.post("/", validate(createContactSchema), createContact);

// Protected routes (Admin only)
router.use(authGuard);
router.use(adminGuard);

router.get("/", getContacts);
router.put("/:id", validate(updateContactSchema), updateContact);
router.delete("/:id", deleteContact);

export default router;

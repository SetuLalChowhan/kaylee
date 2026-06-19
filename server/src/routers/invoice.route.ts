import express from "express";
import {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createInvoiceSchema, updateInvoiceSchema } from "../validations/invoice.validation.js";

const router = express.Router();

// All invoice routes require being logged in
router.use(authGuard);

router.post("/", validate(createInvoiceSchema), createInvoice);
router.get("/", getInvoices);
router.patch("/:id", validate(updateInvoiceSchema), updateInvoice);
router.delete("/:id", deleteInvoice);

export default router;

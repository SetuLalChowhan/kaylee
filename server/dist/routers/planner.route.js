import express from "express";
import { getTasks, createTask, updateTask, deleteTask, } from "../controllers/planner.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTaskSchema, updateTaskSchema } from "../validations/planner.validation.js";
const router = express.Router();
router.use(authGuard);
router.get("/", getTasks);
router.post("/", validate(createTaskSchema), createTask);
router.patch("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);
export default router;
//# sourceMappingURL=planner.route.js.map
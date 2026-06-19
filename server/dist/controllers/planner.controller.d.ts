import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/planner — Retrieve user's planner tasks
 */
export declare const getTasks: (req: Request, res: Response, next: NextFunction) => void;
/**
 * POST /api/planner — Create a new task
 */
export declare const createTask: (req: Request, res: Response, next: NextFunction) => void;
/**
 * PATCH /api/planner/:id — Update a task
 */
export declare const updateTask: (req: Request, res: Response, next: NextFunction) => void;
/**
 * DELETE /api/planner/:id — Delete a task
 */
export declare const deleteTask: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=planner.controller.d.ts.map
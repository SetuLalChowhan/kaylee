import { ZodError, type ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const validate = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.slice(1).join("."),
          message: err.message,
        }));

        return res.status(400).json({
          status: "fail",
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      next(error);
    }
  };
};
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Assign parsed (transformed) data back so z.preprocess, z.transform, z.default work
            req.body = parsed.body;
            next();
        }
        catch (error) {
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
//# sourceMappingURL=validate.middleware.js.map
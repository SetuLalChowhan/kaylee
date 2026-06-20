import { AppError } from "../utils/AppError.js";
export const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Transform Multer errors or file limit errors into operational AppErrors
    if (err.name === "MulterError" || err.code?.startsWith("LIMIT_")) {
        let message = err.message;
        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File is too large. Please upload a smaller file.";
        }
        const operationalErr = new AppError(message, 400);
        error = { ...operationalErr };
        error.message = operationalErr.message;
    }
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";
    // 🔹 DEVELOPMENT MODE
    if (process.env.NODE_ENV === "development") {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            stack: err.stack,
        });
    }
    // 🔹 PRODUCTION MODE
    if (error.isOperational) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    }
    // 🔥 Unknown error
    console.error("ERROR 💥", err);
    return res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
    });
};
//# sourceMappingURL=error.middleware.js.map
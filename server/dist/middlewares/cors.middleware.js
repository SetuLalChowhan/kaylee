import cors from "cors";
const defaultAllowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://stackd12.netlify.app",
    "https://stackdadmin.netlify.app",
    "https://stakd.co",
    "https://www.stakd.co",
    "https://admin.getstakd.co",
    "https://getstakd.co",
    "https://www.getstakd.co",
    "https://api.getstakd.co",
];
const envAllowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));
export const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
});
//# sourceMappingURL=cors.middleware.js.map
import dotenv from "dotenv";
dotenv.config();
// Ensure PREVIEW_TOKEN_SECRET fallback for dev if ACCESS_TOKEN_SECRET exists
if (!process.env.PREVIEW_TOKEN_SECRET && process.env.ACCESS_TOKEN_SECRET) {
    process.env.PREVIEW_TOKEN_SECRET = `${process.env.ACCESS_TOKEN_SECRET}_preview_secret`;
}
// ── Startup Environment Validation ──────────────────────────────────────────
const requiredEnv = [
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "RESET_TOKEN_SECRET",
    "PREVIEW_TOKEN_SECRET",
    "DATABASE_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`FATAL: Missing required environment variable(s): ${missingEnv.join(", ")}`);
    process.exit(1);
}
import app from "./app.js";
import { runSeeds } from "./seeds/index.js";
const PORT = process.env.PORT || 3000;
runSeeds();
app.listen(PORT, () => {
    console.log(`Server running → http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map
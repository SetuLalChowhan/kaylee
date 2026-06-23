import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("CRITICAL ERROR: DATABASE_URL environment variable is not defined!");
}
const pool = new pg.Pool({ connectionString });
// Prevent process crash on idle pg client errors
pool.on("error", (err) => {
    console.error("Unexpected error on idle pg client:", err);
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export default prisma;
//# sourceMappingURL=db.js.map
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString: string | undefined = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("CRITICAL ERROR: DATABASE_URL environment variable is not defined!");
}

const isLocal =
  !connectionString ||
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("sslmode=disable");

const pool = new pg.Pool({
  connectionString,
  ssl: isLocal
    ? false
    : {
        rejectUnauthorized: false,
      },
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  max: 20,
});

// Prevent process crash on idle pg client errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle pg client:", err);
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("DATABASE_URL is not defined in environment.");
    }
    const isNeon = connectionString?.includes("neon.tech");

    pool = new Pool({
      connectionString: connectionString || "postgres://postgres:postgres@localhost:5432/rafiq",
      ssl: isNeon ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export const db = drizzle(getPool(), { schema });

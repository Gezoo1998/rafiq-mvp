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
    const isCloud =
      connectionString &&
      !connectionString.includes("localhost") &&
      !connectionString.includes("127.0.0.1");
    const ssl =
      isCloud || connectionString?.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined;

    pool = new Pool({
      connectionString: connectionString || "postgres://postgres:postgres@localhost:5432/rafiq",
      ssl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export const db = drizzle(getPool(), { schema });


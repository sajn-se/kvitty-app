import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required but was not set.");
}

console.log("DATABASE_URL:", databaseUrl);

if (/\/\/[^:/]+:@/.test(databaseUrl)) {
  console.error("DATABASE_URL has an empty password. Check the connection string.");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

try {
  await pool.query("select 1");
} catch (error) {
  console.error("Database connection check failed. Verify DATABASE_URL and that Postgres is reachable.", error);
}

export const db = drizzle(pool, { schema });

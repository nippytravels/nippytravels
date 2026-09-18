import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";

async function main() {
  const pool = postgres(process.env.DATABASE_URL!);

  const db = drizzle(pool, { schema });

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle/" });
  console.log("Migrations complete.");

  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

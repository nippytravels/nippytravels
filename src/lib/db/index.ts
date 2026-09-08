import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import Env from "@/env";
import * as schema from "./schema";

const client = createClient({
  url: Env.TURSO_DATABASE_URL,
  authToken: Env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

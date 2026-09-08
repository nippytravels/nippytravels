import { eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { user } from "@/lib/db/schema";

const email = process.argv[2];
if (!email) throw new Error("Usage: bun run scripts/promote-admin.ts <email>");

await db.update(user).set({ role: "admin" }).where(eq(user.email, email));
console.log(`Promoted ${email} to admin`);

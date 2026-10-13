import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

const email = process.argv[2];
const password = process.argv[3] || "password123";
if (!email)
  throw new Error("Usage: bun run scripts/create-admin-user.ts <email>");

async function main() {
  const result = await auth.api.signUpEmail({
    body: {
      name: "Nippy Travels Admin",
      email,
      password,
    },
  });

  // ensure the user account is an admin
  await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

console.log(`Created admin user`);

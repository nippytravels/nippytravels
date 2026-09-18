import { db } from "@/lib/db/index";
import { user } from "@/lib/db/schema";

const email = process.argv[2];
if (!email)
  throw new Error("Usage: bun run scripts/create-admin-user.ts <email>");

await db.insert(user).values({
  role: "admin",
  email,
  id: crypto.randomUUID(),
  name: email.split("@")[0],
  emailVerified: true,
  banned: false,
  image: "",
  createdAt: new Date(),
  updatedAt: new Date(),
});

console.log(`Promoted ${email} to admin`);

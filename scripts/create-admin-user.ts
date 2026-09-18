import { auth } from "@/lib/auth";

const email = process.argv[2];
if (!email)
  throw new Error("Usage: bun run scripts/create-admin-user.ts <email>");

async function main() {
  const result = await auth.api.signUpEmail({
    body: {
      name: "Nippy Travels Admin",
      email,
      password: "password123",
    },
  });

  console.log(result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

console.log(`Created admin user`);

import { db } from "@/lib/db";

const field = process.argv[2];
const print = process.argv[3] === "true" || false;

if (!field) throw new Error("The field you are trying to read is required");

async function main() {
  if (field === "requests") {
    const data = await db.query.requests.findMany({
      with: {
        children: true,
      },
    });

    console.log(`Found ${data.length} requests`);
    if (print) {
      console.log(data);
    }
  }

  if (field === "users") {
    const data = await db.query.user.findMany({});
    console.log(`Found ${data.length} users`);
    if (print) {
      console.log(data);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

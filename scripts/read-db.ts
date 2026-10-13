import { db } from "@/lib/db";

async function main() {
  const data = await db.query.requests.findMany({
    with: {
      children: true,
    },
  });

  console.log(`Fetched ${data.length} requests`);
  console.log(data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

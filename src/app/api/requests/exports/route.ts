import { db } from "@/lib/db";

export async function POST() {
  const requests = await db.query.requests.findMany({
    with: {
      children: true,
    },
  });

  console.log({ requests });

  // TODO: create a CSV file and generate download link
}

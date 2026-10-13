import { db } from "@/lib/db";

const data = await db.query.requests.findMany();

console.log({ data });

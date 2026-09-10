import { db } from "@/lib/db";

const data = await db.query.form.findMany();

console.log({ data });

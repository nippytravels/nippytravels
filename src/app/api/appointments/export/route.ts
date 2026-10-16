import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/csv";
import { appointmentSearch } from "@/lib/db/filters";
import { db } from "@/lib/db/index";
import { appointmentStatus, appointments } from "@/lib/db/schema";

const MAX_ROWS = 10_000;

async function getRows(filters: {
  status?: (typeof appointmentStatus.enumValues)[number];
  q?: string;
}) {
  const search = appointmentSearch(filters.q);
  const where = and(
    filters.status ? eq(appointments.status, filters.status) : undefined,
    search.where,
  );

  const { searchVector: _vec, ...columns } = getTableColumns(appointments);

  return db
    .select(columns)
    .from(appointments)
    .where(where)
    .orderBy(
      ...(search.rank ? [desc(search.rank)] : []),
      desc(appointments.submittedAt),
    )
    .limit(MAX_ROWS);
}

type Row = Awaited<ReturnType<typeof getRows>>[number];

const fields: [header: string, value: (r: Row) => unknown][] = [
  ["Reference", (r) => `AP-${String(r.referenceNumber).padStart(4, "0")}`],
  ["Status", (r) => r.status],
  ["Submitted at", (r) => r.submittedAt],
  ["Email", (r) => r.email],
  ["Destination", (r) => r.destination],
  ["Travel date", (r) => r.travelDate],
  ["Scheduled for", (r) => r.scheduledFor],
  ["Notes", (r) => r.notes],
];

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "admin")
    return new Response("Forbidden", { status: 403 });

  // Same filters as the dashboard page, so the file matches what is on screen
  const params = new URL(req.url).searchParams;
  const status = appointmentStatus.enumValues.find(
    (s) => s === params.get("status"),
  );
  const rows = await getRows({ status, q: params.get("q") ?? undefined });

  const csv = toCsv(
    fields.map(([header]) => header),
    rows.map((r) => fields.map(([, value]) => value(r))),
  );

  return csvResponse(
    `appointments-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
  );
}

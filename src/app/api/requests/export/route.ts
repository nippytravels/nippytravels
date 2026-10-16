import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { csvResponse, toCsv } from "@/lib/csv";
import { requestSearch } from "@/lib/db/filters";
import { db } from "@/lib/db/index";
import { requestStatus, requests } from "@/lib/db/schema";

const MAX_ROWS = 10_000;

async function getRows(filters: {
  status?: (typeof requestStatus.enumValues)[number];
  q?: string;
}) {
  const search = requestSearch(filters.q);
  const where = and(
    filters.status ? eq(requests.status, filters.status) : undefined,
    search.where,
  );

  // Never export the encrypted passport number; the last 4 digits are enough
  const {
    passportNumberEnc: _enc,
    searchVector: _vec,
    ...columns
  } = getTableColumns(requests);

  return db
    .select({
      ...columns,
      children: sql<string>`coalesce((
        select string_agg(c.full_name || ' (' || c.date_of_birth::text || ')', '; ' order by c.position)
        from request_children c
        where c.request_id = ${requests.id}
      ), '')`,
    })
    .from(requests)
    .where(where)
    .orderBy(
      ...(search.rank ? [desc(search.rank)] : []),
      desc(requests.submittedAt),
    )
    .limit(MAX_ROWS);
}

type Row = Awaited<ReturnType<typeof getRows>>[number];

const fields: [header: string, value: (r: Row) => unknown][] = [
  ["Reference", (r) => `NT-${String(r.referenceNumber).padStart(4, "0")}`],
  ["Status", (r) => r.status],
  ["Submitted at", (r) => r.submittedAt],
  ["First name", (r) => r.firstName],
  ["Middle name", (r) => r.middleName],
  ["Last name", (r) => r.lastName],
  ["Date of birth", (r) => r.dateOfBirth],
  ["Marital status", (r) => r.maritalStatus],
  ["Spouse name", (r) => r.spouseName],
  ["Spouse date of birth", (r) => r.spouseDateOfBirth],
  ["Passport (last 4)", (r) => r.passportLast4],
  ["Passport issued", (r) => r.passportIssueDate],
  ["Passport expires", (r) => r.passportExpiryDate],
  ["Home address", (r) => r.homeAddress],
  ["Phone", (r) => r.phone],
  ["Email", (r) => r.email],
  ["Employer", (r) => r.employerName],
  ["Employer address", (r) => r.employerAddress],
  ["Employer email", (r) => r.employerEmail],
  ["Mother", (r) => r.motherName],
  ["Mother date of birth", (r) => r.motherDateOfBirth],
  ["Father", (r) => r.fatherName],
  ["Father date of birth", (r) => r.fatherDateOfBirth],
  ["Children", (r) => r.children],
  ["Ever refused a visa", (r) => (r.visaRefused ? "Yes" : "No")],
  ["Ever issued a visa", (r) => (r.visaIssued ? "Yes" : "No")],
];

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "admin")
    return new Response("Forbidden", { status: 403 });

  // Same filters as the dashboard page, so the file matches what is on screen
  const params = new URL(req.url).searchParams;
  const status = requestStatus.enumValues.find(
    (s) => s === params.get("status"),
  );
  const rows = await getRows({ status, q: params.get("q") ?? undefined });

  const csv = toCsv(
    fields.map(([header]) => header),
    rows.map((r) => fields.map(([, value]) => value(r))),
  );

  return csvResponse(
    `requests-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
  );
}

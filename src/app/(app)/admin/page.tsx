import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  or,
  sql,
} from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Pagination from "@/components/pagination";
import { db } from "@/lib/db/index"; // your Drizzle instance (the one Better Auth uses)
import { requestChildren, requestStatus, requests } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Requests" };

/* ----------------------------------- Types ---------------------------------- */

type Status = (typeof requestStatus.enumValues)[number];
type SearchParams = Promise<{
  page?: string;
  status?: string;
  q?: string;
  id?: string;
}>;
type Params = Awaited<SearchParams>;
type RequestDetail = NonNullable<Awaited<ReturnType<typeof getRequest>>>;

const PAGE_SIZE = 8;

const statusLabels: Record<Status, string> = {
  new: "New",
  "in-review": "In review",
  "awaiting-info": "Awaiting info",
  booked: "Booked",
};

const statusStyles: Record<Status, string> = {
  new: "bg-clay-100 text-clay-800",
  "in-review": "bg-sage-100 text-sage-800",
  "awaiting-info": "bg-ochre-100 text-ochre-800",
  booked: "bg-ink text-sand",
};

const isStatus = (v?: string): v is Status =>
  !!v && (requestStatus.enumValues as readonly string[]).includes(v);
const isUuid = (v?: string): v is string =>
  !!v &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/* ------------------------------------ Data ----------------------------------- */

// Name, email and employer go through the generated tsvector (prefix matching, so it works
// while typing). References like "NT-0142" or "142" are matched with an equality check.
function buildSearch(q?: string) {
  const text = q?.trim();
  if (!text) return {};

  const terms = text
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  const tsquery = terms.map((t) => `${t}:*`).join(" & ");

  const matches = tsquery
    ? sql`${requests.searchVector} @@ to_tsquery('simple', ${tsquery})`
    : undefined;
  const rank = tsquery
    ? sql`ts_rank(${requests.searchVector}, to_tsquery('simple', ${tsquery}))`
    : undefined;

  const ref = /^(?:nt-?)?(\d{1,9})$/i.exec(text);
  const byReference = ref
    ? eq(requests.referenceNumber, Number(ref[1]))
    : undefined;

  return { where: or(matches, byReference), rank };
}

async function getRequests(opts: {
  page: number;
  status?: Status;
  q?: string;
}) {
  const search = buildSearch(opts.q);
  const where = and(
    opts.status ? eq(requests.status, opts.status) : undefined,
    search.where,
  );

  const [{ total }] = await db
    .select({ total: count() })
    .from(requests)
    .where(where);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(opts.page, totalPages);

  // Only the columns the list shows; never the encrypted passport number
  const rows = await db
    .select({
      id: requests.id,
      referenceNumber: requests.referenceNumber,
      status: requests.status,
      firstName: requests.firstName,
      middleName: requests.middleName,
      lastName: requests.lastName,
      email: requests.email,
      submittedAt: requests.submittedAt,
    })
    .from(requests)
    .where(where)
    .orderBy(
      ...(search.rank ? [desc(search.rank)] : []),
      desc(requests.submittedAt),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return { rows, total, page, totalPages };
}

async function getRequest(id: string) {
  // Leave out the encrypted passport number and the search vector
  const {
    passportNumberEnc: _enc,
    searchVector: _vec,
    ...columns
  } = getTableColumns(requests);

  const [row] = await db
    .select(columns)
    .from(requests)
    .where(eq(requests.id, id))
    .limit(1);
  if (!row) return undefined;

  const children = await db
    .select()
    .from(requestChildren)
    .where(eq(requestChildren.requestId, id))
    .orderBy(asc(requestChildren.position));

  return { ...row, children };
}

/* ---------------------------------- Helpers ---------------------------------- */

// Date-only values are stored as yyyy-MM-dd, so format them in UTC to avoid off-by-one days
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : dateFmt.format(d);
};
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const yesNo = (v: boolean) => (v ? "Yes" : "No");
const reference = (n: number) => `NT-${String(n).padStart(4, "0")}`;
const fullName = (r: {
  firstName: string;
  middleName: string | null;
  lastName: string;
}) => [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ");

// Builds a /admin URL from the current params plus changes
const href = (sp: Params, patch: Partial<Params>) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/admin?${s}` : "/admin";
};

/* ------------------------------------ Page ----------------------------------- */

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const status = isStatus(sp.status) ? sp.status : undefined;
  const requestedPage = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const { rows, total, page, totalPages } = await getRequests({
    page: requestedPage,
    status,
    q: sp.q,
  });

  // The chosen request, falling back to the first one on the page
  const chosen = isUuid(sp.id) ? await getRequest(sp.id) : undefined;
  const selected =
    chosen ?? (rows[0] ? await getRequest(rows[0].id) : undefined);

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-sand-300 px-6 py-4 lg:h-20 lg:flex-none lg:py-0">
        <h1 className="font-display text-[26px] tracking-[-0.01em] lg:flex-1 lg:text-[30px]">
          Requests
        </h1>
        <form action="/admin" method="get" className="w-full lg:w-[300px]">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={sp.q}
            aria-label="Search requests"
            placeholder="Search name, email or reference"
            className="h-11 w-full rounded-xl border border-sand-400 bg-white px-4 text-[15px] text-ink placeholder:text-stone/70 focus:border-clay focus:outline-2 focus:outline-offset-1 focus:outline-clay"
          />
        </form>
        <a
          href="/api/requests/export"
          className="inline-flex min-h-11 items-center rounded-full border border-sand-400 bg-white px-5 text-sm font-semibold transition hover:bg-sand-100"
        >
          Export CSV
        </a>
      </header>

      <nav
        aria-label="Filter by status"
        className="flex flex-none gap-6 overflow-x-auto border-b border-sand-300 px-6"
      >
        {[undefined, ...requestStatus.enumValues].map((s) => (
          <Link
            key={s ?? "all"}
            href={href(sp, { status: s, page: undefined, id: undefined })}
            aria-current={s === status ? "page" : undefined}
            className={`flex min-h-11 items-center whitespace-nowrap border-b-2 text-sm font-semibold ${
              s === status
                ? "border-clay text-ink"
                : "border-transparent text-stone hover:text-ink"
            }`}
          >
            {s ? statusLabels[s] : "All"}
          </Link>
        ))}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* List */}
        <section className="flex min-w-0 flex-1 flex-col lg:overflow-auto">
          <div className="hidden grid-cols-[1.6fr_1.5fr_1fr_120px] gap-4 border-b border-sand-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-stone md:grid">
            <span>Applicant</span>
            <span>Email</span>
            <span>Submitted</span>
            <span>Status</span>
          </div>

          {rows.length === 0 ? (
            <p className="px-6 py-16 text-center text-stone">
              {sp.q
                ? `No requests match “${sp.q}”.`
                : "No requests match your filters."}
            </p>
          ) : (
            <ul>
              {rows.map((r) => {
                const isSelected = r.id === selected?.id;
                return (
                  <li
                    key={r.id}
                    className={`relative grid grid-cols-[1fr_auto] items-center gap-4 border-b border-sand-300 px-6 py-4 text-sm md:grid-cols-[1.6fr_1.5fr_1fr_120px] ${
                      isSelected ? "bg-sand-100" : "hover:bg-sand-100/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <Link
                        href={href(sp, { id: r.id })}
                        aria-current={isSelected ? "true" : undefined}
                        className="block truncate text-[15px] font-semibold after:absolute after:inset-0"
                      >
                        {fullName(r)}
                      </Link>
                      <div className="mt-0.5 text-[13px] text-stone">
                        {reference(r.referenceNumber)}
                      </div>
                    </div>
                    <span className="hidden truncate md:block">{r.email}</span>
                    <span className="hidden md:block">
                      {formatDate(r.submittedAt)}
                    </span>
                    <span>
                      <StatusPill status={r.status} />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-auto flex flex-col items-center gap-4 px-6 py-8">
            <p className="text-[13px] text-stone">
              {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
              {sp.q && (
                <>
                  {" · "}
                  <Link
                    href={href(sp, {
                      q: undefined,
                      page: undefined,
                      id: undefined,
                    })}
                    className="font-semibold text-ink underline decoration-sand-400 underline-offset-4 hover:decoration-clay"
                  >
                    Clear search
                  </Link>
                </>
              )}
            </p>
            <Suspense>
              <Pagination currentPage={page} totalPages={totalPages} />
            </Suspense>
          </div>
        </section>

        {/* Detail */}
        <aside
          aria-label="Request details"
          className="w-full border-t border-sand-300 bg-white lg:w-[480px] lg:flex-none lg:overflow-auto lg:border-l lg:border-t-0"
        >
          {selected ? (
            <Detail r={selected} />
          ) : (
            <p className="p-8 text-stone">
              Select a request to see its details.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

/* --------------------------------- Components -------------------------------- */

function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-sand-300 px-7 py-6">
      <h3 className="mb-4 font-display text-lg">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</dl>
    </section>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-stone">
        {label}
      </dt>
      <dd className="text-[15px]">{children || "—"}</dd>
    </div>
  );
}

function Detail({ r }: { r: RequestDetail }) {
  const ref = reference(r.referenceNumber);

  return (
    <>
      <div className="p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[28px] tracking-[-0.01em]">
              {fullName(r)}
            </h2>
            <p className="mt-1.5 text-[13px] text-stone">
              {ref} · Submitted {formatDate(r.submittedAt)}
            </p>
          </div>
          <StatusPill status={r.status} />
        </div>
        <a
          href={`mailto:${r.email}?subject=${encodeURIComponent(`Your request ${ref}`)}`}
          className="mt-5 inline-flex min-h-11 items-center rounded-full border border-clay bg-clay px-5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Email applicant
        </a>
      </div>

      <Section title="Personal details">
        <Field label="Full name">{fullName(r)}</Field>
        <Field label="Date of birth">{formatDate(r.dateOfBirth)}</Field>
        <Field label="Marital status">{titleCase(r.maritalStatus)}</Field>
        {r.maritalStatus === "married" && (
          <>
            <Field label="Spouse">{r.spouseName}</Field>
            <Field label="Spouse's date of birth">
              {formatDate(r.spouseDateOfBirth)}
            </Field>
          </>
        )}
      </Section>

      <Section title="Passport">
        <Field label="Passport number">•••• {r.passportLast4}</Field>
        <Field label="Issued">{formatDate(r.passportIssueDate)}</Field>
        <Field label="Expires">{formatDate(r.passportExpiryDate)}</Field>
      </Section>

      <Section title="Contact">
        <Field label="Phone">{r.phone}</Field>
        <Field label="Email">{r.email}</Field>
        <Field label="Home address" wide>
          {r.homeAddress}
        </Field>
      </Section>

      <Section title="Employment">
        <Field label="Employer">{r.employerName}</Field>
        <Field label="Employer email">{r.employerEmail}</Field>
        <Field label="Employer address" wide>
          {r.employerAddress}
        </Field>
      </Section>

      <Section title="Family">
        <Field label="Mother">{r.motherName}</Field>
        <Field label="Born">{formatDate(r.motherDateOfBirth)}</Field>
        <Field label="Father">{r.fatherName}</Field>
        <Field label="Born">{formatDate(r.fatherDateOfBirth)}</Field>
        <Field label="Children" wide>
          {r.children.length === 0
            ? "None"
            : r.children
                .map((c) => `${c.fullName} (${formatDate(c.dateOfBirth)})`)
                .join(", ")}
        </Field>
      </Section>

      <Section title="Visa history">
        <Field label="Ever refused a visa">{yesNo(r.visaRefused)}</Field>
        <Field label="Ever issued a visa">{yesNo(r.visaIssued)}</Field>
      </Section>
    </>
  );
}

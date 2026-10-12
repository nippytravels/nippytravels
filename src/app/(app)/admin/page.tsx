import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Pagination from "@/components/pagination";

export const metadata: Metadata = { title: "Requests – Nippy Travels" };

/* ----------------------------------- Types ---------------------------------- */

type Status = "new" | "in-review" | "awaiting-info" | "booked";
type YesNo = "yes" | "no";

type RequestRecord = {
  id: string;
  reference: string;
  submittedAt: string;
  status: Status;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  maritalStatus: string;
  spouseName?: string;
  spouseDateOfBirth?: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  homeAddress: string;
  phone: string;
  email: string;
  employerName: string;
  employerAddress: string;
  employerEmail: string;
  motherName: string;
  motherDateOfBirth: string;
  fatherName: string;
  fatherDateOfBirth: string;
  children: { fullName: string; dateOfBirth: string }[];
  visaRefused: YesNo;
  visaIssued: YesNo;
};

type SearchParams = Promise<{
  page?: string;
  status?: string;
  q?: string;
  id?: string;
}>;
type Params = Awaited<SearchParams>;

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

const isStatus = (v?: string): v is Status => !!v && v in statusLabels;

/* ------------------------------------ Data ----------------------------------- */
/* SAMPLE DATA: replace getRequests and getRequest with your database queries. */

const people = [
  ["Amara", "Okafor"],
  ["Daniel", "Mensah"],
  ["Chiamaka", "Eze"],
  ["Tunde", "Bello"],
  ["Fatima", "Sani"],
  ["Ngozi", "Adeyemi"],
  ["Ibrahim", "Musa"],
  ["Kemi", "Balogun"],
];
const cycle: Status[] = [
  "in-review",
  "new",
  "awaiting-info",
  "booked",
  "awaiting-info",
  "new",
  "in-review",
  "booked",
];

const sample: RequestRecord[] = Array.from({ length: 23 }, (_, i) => {
  const [firstName, lastName] = people[i % people.length];
  const married = i % 3 === 0;
  return {
    id: `req_${142 - i}`,
    reference: `NT-${String(142 - i).padStart(4, "0")}`,
    submittedAt: new Date(Date.UTC(2026, 9, 12 - i, 9, 14)).toISOString(),
    status: cycle[i % cycle.length],
    firstName,
    lastName,
    dateOfBirth: "1991-03-14",
    maritalStatus: married ? "married" : "single",
    spouseName: married ? "Sample Spouse" : undefined,
    spouseDateOfBirth: married ? "1990-06-02" : undefined,
    passportNumber: `A${String(4821 + i).padStart(8, "0")}`,
    passportIssueDate: "2022-08-03",
    passportExpiryDate: "2030-08-02",
    homeAddress: "[Home address]",
    phone: "+234 801 234 5678",
    email: `${firstName.toLowerCase()}@example.com`,
    employerName: "[Employer name]",
    employerAddress: "[Employer address]",
    employerEmail: "hr@example.com",
    motherName: "[Mother's full name]",
    motherDateOfBirth: "1963-01-20",
    fatherName: "[Father's full name]",
    fatherDateOfBirth: "1960-05-11",
    children: married
      ? [{ fullName: "[Child's full name]", dateOfBirth: "2018-09-30" }]
      : [],
    visaRefused: "no",
    visaIssued: i % 2 === 0 ? "yes" : "no",
  };
});

async function getRequests(opts: {
  page: number;
  status?: Status;
  q?: string;
}) {
  const q = opts.q?.trim().toLowerCase();
  const filtered = sample.filter(
    (r) =>
      (!opts.status || r.status === opts.status) &&
      (!q ||
        `${r.firstName} ${r.lastName} ${r.email} ${r.reference}`
          .toLowerCase()
          .includes(q)),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(opts.page, totalPages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { rows, total: filtered.length, page, totalPages };
}

async function getRequest(id: string) {
  return sample.find((r) => r.id === id);
}

/* ---------------------------------- Helpers ---------------------------------- */

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateFmt.format(d);
};
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fullName = (r: RequestRecord) =>
  [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ");

// Builds a /dashboard URL from the current params plus changes
const href = (sp: Params, patch: Partial<Params>) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/dashboard?${s}` : "/dashboard";
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
  const selected = (sp.id ? await getRequest(sp.id) : undefined) ?? rows[0];

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex min-h-screen flex-col bg-sand text-ink lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:min-h-0">
        <header className="flex flex-wrap items-center gap-3 border-b border-sand-300 px-6 py-4 lg:h-20 lg:flex-none lg:py-0">
          <h1 className="font-display text-[26px] tracking-[-0.01em] lg:flex-1 lg:text-[30px]">
            Requests
          </h1>
          <form
            action="/dashboard"
            method="get"
            role="search"
            className="w-full lg:w-[300px]"
          >
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
          {[undefined, ...(Object.keys(statusLabels) as Status[])].map((s) => (
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
                No requests match your filters.
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
                          {r.reference}
                        </div>
                      </div>
                      <span className="hidden truncate md:block">
                        {r.email}
                      </span>
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
                {total === 0
                  ? "No results"
                  : `Showing ${from}–${to} of ${total}`}
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
    </div>
  );
}

/* --------------------------------- Components -------------------------------- */

const navItems = [
  {
    label: "Requests",
    href: "/dashboard",
    d: "M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5",
    active: true,
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    d: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4",
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    d: "M3 8h18v11H3zM9 8V5h6v3",
  },
  {
    label: "Form settings",
    href: "/dashboard/settings",
    d: "M4 7h10M18 7h2M4 17h2M10 17h10",
  },
];

// Move into app/dashboard/layout.tsx when the other dashboard pages exist
function Sidebar() {
  return (
    <aside className="hidden w-60 flex-none flex-col bg-ink px-4 py-7 text-sand lg:flex">
      <Link href="/" className="px-3 pb-7 font-display text-[22px]">
        Nippy Travels
      </Link>
      <nav aria-label="Dashboard" className="flex flex-col gap-1">
        {navItems.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            aria-current={n.active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-medium ${
              n.active
                ? "bg-ink-700 text-sand"
                : "text-sage-mist hover:bg-ink-800"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={n.d} />
            </svg>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-ink-700 px-3 pt-4 text-sm text-sage-mist">
        [Owner name]
        <br />
        <span className="text-[13px]">[owner email]</span>
      </div>
    </aside>
  );
}

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

function Detail({ r }: { r: RequestRecord }) {
  return (
    <>
      <div className="p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[28px] tracking-[-0.01em]">
              {fullName(r)}
            </h2>
            <p className="mt-1.5 text-[13px] text-stone">
              {r.reference} · Submitted {formatDate(r.submittedAt)}
            </p>
          </div>
          <StatusPill status={r.status} />
        </div>
        <a
          href={`mailto:${r.email}?subject=${encodeURIComponent(`Your request ${r.reference}`)}`}
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
        <Field label="Passport number">•••• {r.passportNumber.slice(-4)}</Field>
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
        <Field label="Ever refused a visa">{titleCase(r.visaRefused)}</Field>
        <Field label="Ever issued a visa">{titleCase(r.visaIssued)}</Field>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Pagination from "@/components/pagination";
import { getAppointment, getAppointments } from "@/lib/cached";
import { appointmentStatus } from "@/lib/db/schema";
import * as Utils from "@/lib/utils";

export const metadata: Metadata = { title: "Appointments" };

type Status = (typeof appointmentStatus.enumValues)[number];
type SearchParams = Promise<{
  page?: string;
  status?: string;
  q?: string;
  id?: string;
}>;
type AppointmentDetail = NonNullable<
  Awaited<ReturnType<typeof getAppointment>>
>;

const BASE_PATH = "/dashboard/appointments";

const statusLabels: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusStyles: Record<Status, string> = {
  new: "bg-clay-100 text-clay-800",
  contacted: "bg-ochre-100 text-ochre-800",
  scheduled: "bg-sage-100 text-sage-800",
  completed: "bg-ink text-sand",
  cancelled: "bg-sand-300 text-stone",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const status = Utils.isStatus(sp.status) ? sp.status : undefined;
  const requestedPage = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const { rows, total, page, totalPages } = await getAppointments({
    page: requestedPage,
    status,
    q: sp.q,
  });

  // The chosen appointment, falling back to the first one on the page
  const chosen = Utils.isUuid(sp.id) ? await getAppointment(sp.id) : undefined;
  const selected =
    chosen ?? (rows[0] ? await getAppointment(rows[0].id) : undefined);

  const from = total === 0 ? 0 : (page - 1) * Utils.PAGE_SIZE + 1;
  const to = Math.min(page * Utils.PAGE_SIZE, total);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-sand-300 px-6 py-4 lg:h-20 lg:flex-none lg:py-0">
        <h1 className="font-display text-[26px] tracking-[-0.01em] lg:flex-1 lg:text-[30px]">
          Appointments
        </h1>
        <form action={BASE_PATH} method="get" className="w-full lg:w-[300px]">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={sp.q}
            aria-label="Search appointments"
            placeholder="Search email, destination or reference"
            className="h-11 w-full rounded-xl border border-sand-400 bg-white px-4 text-[15px] text-ink placeholder:text-stone/70 focus:border-clay focus:outline-2 focus:outline-offset-1 focus:outline-clay"
          />
        </form>
        <a
          href="/api/appointments/export"
          className="inline-flex min-h-11 items-center rounded-full border border-sand-400 bg-white px-5 text-sm font-semibold transition hover:bg-sand-100"
        >
          Export CSV
        </a>
      </header>

      <nav
        aria-label="Filter by status"
        className="flex flex-none gap-6 overflow-x-auto border-b border-sand-300 px-6"
      >
        {[undefined, ...appointmentStatus.enumValues].map((s) => (
          <Link
            key={s ?? "all"}
            href={Utils.href(sp, { status: s, page: undefined, id: undefined })}
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
          <div className="hidden grid-cols-[1.8fr_1.2fr_1fr_120px] gap-4 border-b border-sand-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-stone md:grid">
            <span>Contact</span>
            <span>Destination</span>
            <span>Travel date</span>
            <span>Status</span>
          </div>

          {rows.length === 0 ? (
            <p className="px-6 py-16 text-center text-stone">
              {sp.q
                ? `No appointments match “${sp.q}”.`
                : "No appointments match your filters."}
            </p>
          ) : (
            <ul>
              {rows.map((r) => {
                const isSelected = r.id === selected?.id;
                return (
                  <li
                    key={r.id}
                    className={`relative grid grid-cols-[1fr_auto] items-center gap-4 border-b border-sand-300 px-6 py-4 text-sm md:grid-cols-[1.8fr_1.2fr_1fr_120px] ${
                      isSelected ? "bg-sand-100" : "hover:bg-sand-100/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <Link
                        href={Utils.href(sp, { id: r.id })}
                        aria-current={isSelected ? "true" : undefined}
                        className="block truncate text-[15px] font-semibold after:absolute after:inset-0"
                      >
                        {r.email}
                      </Link>
                      <div className="mt-0.5 text-[13px] text-stone">
                        {Utils.reference(r.referenceNumber, "AP")} ·{" "}
                        {Utils.formatDay(r.submittedAt)}
                      </div>
                    </div>
                    <span className="hidden truncate md:block">
                      {r.destination}
                    </span>
                    <span className="hidden md:block">
                      {Utils.formatDate(r.travelDate)}
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
                    href={Utils.href(sp, {
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
          aria-label="Appointment details"
          className="w-full border-t border-sand-300 bg-white lg:w-[480px] lg:flex-none lg:overflow-auto lg:border-l lg:border-t-0"
        >
          {selected ? (
            <Detail a={selected} />
          ) : (
            <p className="p-8 text-stone">
              Select an appointment to see its details.
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

function Detail({ a }: { a: AppointmentDetail }) {
  const ref = Utils.reference(a.referenceNumber);

  return (
    <>
      <div className="p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words font-display text-[26px] tracking-[-0.01em]">
              {a.email}
            </h2>
            <p className="mt-1.5 text-[13px] text-stone">
              {ref} · Submitted {Utils.formatDay(a.submittedAt)}
            </p>
          </div>
          <StatusPill status={a.status} />
        </div>
        <a
          href={`mailto:${a.email}?subject=${encodeURIComponent(`Your appointment request ${ref}`)}`}
          className="mt-5 inline-flex min-h-11 items-center rounded-full border border-clay bg-clay px-5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Email contact
        </a>
      </div>

      <Section title="Trip">
        <Field label="Destination">{a.destination}</Field>
        <Field label="Travel date">{Utils.formatDate(a.travelDate)}</Field>
      </Section>

      <Section title="Appointment">
        <Field label="Scheduled for" wide>
          {a.scheduledFor
            ? Utils.formatDateTime(a.scheduledFor)
            : "Not scheduled yet"}
        </Field>
      </Section>

      <Section title="Notes">
        <Field label="Internal notes" wide>
          {a.notes ?? "No notes yet"}
        </Field>
      </Section>
    </>
  );
}

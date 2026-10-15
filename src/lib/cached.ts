import { and, asc, count, desc, eq, getTableColumns } from "drizzle-orm";
import { cache } from "react";
import { db } from "./db";
import { appointments, requestChildren, requests } from "./db/schema";
import * as Utils from "./utils";

export const getRequests = cache(
  async (opts: { page: number; status?: Status; q?: string }) => {
    const search = Utils.buildSearch(opts.q);
    const where = and(
      opts.status ? eq(requests.status, opts.status) : undefined,
      search.where,
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(requests)
      .where(where);
    const totalPages = Math.max(1, Math.ceil(total / Utils.PAGE_SIZE));
    const page = Math.min(opts.page, totalPages);

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
      .limit(Utils.PAGE_SIZE)
      .offset((page - 1) * Utils.PAGE_SIZE);

    return { rows, total, page, totalPages };
  },
);

export const getRequest = cache(async (id: string) => {
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
});

export const getAppointments = cache(
  async (opts: { page: number; status?: Status; q?: string }) => {
    const search = Utils.buildSearch(opts.q);
    const where = and(
      opts.status ? eq(appointments.status, opts.status) : undefined,
      search.where,
    );

    const [{ total }] = await db
      .select({ total: count() })
      .from(appointments)
      .where(where);
    const totalPages = Math.max(1, Math.ceil(total / Utils.PAGE_SIZE));
    const page = Math.min(opts.page, totalPages);

    const rows = await db
      .select({
        id: appointments.id,
        referenceNumber: appointments.referenceNumber,
        status: appointments.status,
        email: appointments.email,
        destination: appointments.destination,
        travelDate: appointments.travelDate,
        submittedAt: appointments.submittedAt,
      })
      .from(appointments)
      .where(where)
      .orderBy(
        ...(search.rank ? [desc(search.rank)] : []),
        desc(appointments.submittedAt),
      )
      .limit(Utils.PAGE_SIZE)
      .offset((page - 1) * Utils.PAGE_SIZE);

    return { rows, total, page, totalPages };
  },
);

export const getAppointment = cache(async (id: string) => {
  // Leave out the search vector
  const { searchVector: _vec, ...columns } = getTableColumns(appointments);

  const [row] = await db
    .select(columns)
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);
  return row;
});

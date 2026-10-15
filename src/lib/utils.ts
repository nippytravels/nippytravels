import { eq, or, sql } from "drizzle-orm";
import { requestStatus, requests } from "./db/schema";

export const TIME_ZONE = "Africa/Lagos";

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function toIsoDate(value: string) {
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (iso) return iso[1];

  const str = /^\w{3} (\w{3}) (\d{1,2}) (\d{4})/.exec(value);
  const month = str ? MONTHS.indexOf(str[1]) : -1;
  if (str && month >= 0) {
    return `${str[3]}-${String(month + 1).padStart(2, "0")}-${str[2].padStart(2, "0")}`;
  }

  throw new Error("One of the dates is not valid.");
}

export function buildSearch(q?: string) {
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

export const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
export const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

export const dayFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

export const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : dateFmt.format(d);
};
export const formatDateTime = (d: Date) => dateTimeFmt.format(d);
export const formatDay = (d: Date) => dayFmt.format(d);
export const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const yesNo = (v: boolean) => (v ? "Yes" : "No");
export const reference = (n: number, pref: string = "NT") =>
  `${pref}-${String(n).padStart(4, "0")}`;
export const fullName = (r: {
  firstName: string;
  middleName: string | null;
  lastName: string;
}) => [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ");

export const PAGE_SIZE = 10;

export const isStatus = (v?: string): v is Status =>
  !!v && (requestStatus.enumValues as readonly string[]).includes(v);
export const isUuid = (v?: string): v is string =>
  !!v &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export const href = (sp: Params, patch: Partial<Params>) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/dashboard?${s}` : "/dashboard";
};

import { eq, or, type SQL, sql } from "drizzle-orm";
import { appointments, requests } from "./schema";

type Search = { where?: SQL; rank?: SQL };

// "ama oka" becomes a prefix query: ama:* & oka:*
function toTsQuery(text: string) {
  return text
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
    .map((t) => `${t}:*`)
    .join(" & ");
}

// "NT-0142", "nt0142" and "142" all give 142
function toReference(text: string, prefix: string) {
  const m = new RegExp(`^(?:${prefix}-?)?(\\d{1,9})$`, "i").exec(text);
  return m ? Number(m[1]) : undefined;
}

// Name, email and employer go through the generated tsvector; references use an equality check
export function requestSearch(q?: string): Search {
  const text = q?.trim();
  if (!text) return {};

  const tsquery = toTsQuery(text);
  const ref = toReference(text, "nt");

  return {
    where: or(
      tsquery
        ? sql`${requests.searchVector} @@ to_tsquery('simple', ${tsquery})`
        : undefined,
      ref !== undefined ? eq(requests.referenceNumber, ref) : undefined,
    ),
    rank: tsquery
      ? sql`ts_rank(${requests.searchVector}, to_tsquery('simple', ${tsquery}))`
      : undefined,
  };
}

// Destination and email go through the generated tsvector; references use an equality check
export function appointmentSearch(q?: string): Search {
  const text = q?.trim();
  if (!text) return {};

  const tsquery = toTsQuery(text);
  const ref = toReference(text, "ap");

  return {
    where: or(
      tsquery
        ? sql`${appointments.searchVector} @@ to_tsquery('simple', ${tsquery})`
        : undefined,
      ref !== undefined ? eq(appointments.referenceNumber, ref) : undefined,
    ),
    rank: tsquery
      ? sql`ts_rank(${appointments.searchVector}, to_tsquery('simple', ${tsquery}))`
      : undefined,
  };
}

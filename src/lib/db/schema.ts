import { relations, type SQL, sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const tsVector = customType<{ data: string }>({
  dataType: () => "tsvector",
});

/* ------------------------------------------------------------------------- */
/* Auth (Better Auth)                                                         */
/* ------------------------------------------------------------------------- */

export const role = pgEnum("role", ["user", "admin"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: role("role"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/* ------------------------------------------------------------------------- */
/* Requests                                                                   */
/* ------------------------------------------------------------------------- */

// Values match the ones used in the UI, so no mapping is needed
export const requestStatus = pgEnum("request_status", [
  "new",
  "in-review",
  "awaiting-info",
  "booked",
]);

export const maritalStatus = pgEnum("marital_status", [
  "single",
  "married",
  "divorced",
  "widowed",
]);

export const requests = pgTable(
  "requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Shown as NT-0142: format with `NT-${String(n).padStart(4, "0")}`
    referenceNumber: integer("reference_number")
      .generatedAlwaysAsIdentity({ startWith: 1 })
      .notNull()
      .unique(),

    status: requestStatus("status").notNull().default("new"),

    // Personal details
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
    maritalStatus: maritalStatus("marital_status").notNull(),
    spouseName: text("spouse_name"),
    spouseDateOfBirth: date("spouse_date_of_birth", { mode: "string" }),

    // Passport: the number is stored encrypted, the UI only ever shows the last 4
    passportNumberEnc: text("passport_number_enc").notNull(),
    passportLast4: varchar("passport_last4", { length: 4 }).notNull(),
    passportIssueDate: date("passport_issue_date", {
      mode: "string",
    }).notNull(),
    passportExpiryDate: date("passport_expiry_date", {
      mode: "string",
    }).notNull(),

    // Contact
    homeAddress: text("home_address").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),

    // Employment
    employerName: text("employer_name").notNull(),
    employerAddress: text("employer_address").notNull(),
    employerEmail: text("employer_email").notNull(),

    // Parents
    motherName: text("mother_name").notNull(),
    motherDateOfBirth: date("mother_date_of_birth", {
      mode: "string",
    }).notNull(),
    fatherName: text("father_name").notNull(),
    fatherDateOfBirth: date("father_date_of_birth", {
      mode: "string",
    }).notNull(),

    // Visa history (the form's Yes / No answers)
    visaRefused: boolean("visa_refused").notNull(),
    visaIssued: boolean("visa_issued").notNull(),

    // Full text search: names (A), email (B), employer (C).
    // 'simple' config on purpose: it doesn't stem, which would mangle names.
    // Reference numbers aren't included; look those up with an equality check.
    searchVector: tsVector("search_vector").generatedAlwaysAs(
      (): SQL => sql`
        setweight(to_tsvector('simple', coalesce(${requests.firstName}, '') || ' ' || coalesce(${requests.middleName}, '') || ' ' || coalesce(${requests.lastName}, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(${requests.email}, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(${requests.employerName}, '')), 'C')
      `,
    ),

    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // Dashboard list: newest first, optionally filtered by status
    index("requests_submitted_at_idx").on(t.submittedAt.desc()),
    index("requests_status_submitted_at_idx").on(
      t.status,
      t.submittedAt.desc(),
    ),
    // Exact email lookups
    index("requests_email_idx").on(t.email),
    // Dashboard search
    index("requests_search_idx").using("gin", t.searchVector),

    check(
      "requests_spouse_when_married",
      sql`${t.maritalStatus} <> 'married' OR (${t.spouseName} IS NOT NULL AND ${t.spouseDateOfBirth} IS NOT NULL)`,
    ),
    check(
      "requests_passport_dates",
      sql`${t.passportExpiryDate} > ${t.passportIssueDate}`,
    ),
  ],
);

export const requestChildren = pgTable(
  "request_children",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
    // Keeps the order the applicant entered them in
    position: smallint("position").notNull().default(0),
  },
  (t) => [index("request_children_request_id_idx").on(t.requestId)],
);

/* -------------------------------- Relations -------------------------------- */

export const requestsRelations = relations(requests, ({ many }) => ({
  children: many(requestChildren),
}));

export const requestChildrenRelations = relations(
  requestChildren,
  ({ one }) => ({
    request: one(requests, {
      fields: [requestChildren.requestId],
      references: [requests.id],
    }),
  }),
);

/* ---------------------------------- Types ---------------------------------- */

export type RequestRow = typeof requests.$inferSelect;
export type NewRequestRow = typeof requests.$inferInsert;
export type RequestChildRow = typeof requestChildren.$inferSelect;
export type NewRequestChildRow = typeof requestChildren.$inferInsert;

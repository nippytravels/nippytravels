// db/schema/auth.ts
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  role: text("role").notNull().default("user"), // "user" | "admin"
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"), // used by admin plugin
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const form = sqliteTable(
  "forms",
  {
    id: text("id").primaryKey(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    middleName: text("middle_name"),
    dateOfBirth: text("date_of_birth"),
    passportNumber: text("passport_number").unique(),
    passportIssueDate: text("passport_issue_date").unique(),
    passportExpiry: text("passport_expiry"),
    maritalStatus: text("marital_status"),
    phoneNumber: text("phone_number").unique(),
    email: text("email").unique(),
    spouseName: text("spouse_name"),
    spouseDateOfBirth: text("spouse_date_of_birth"),
    motherFullName: text("mother_full_name"),
    fatherFullName: text("father_full_name"),
    fatherDateOfBirth: text("father_date_of_birth"),
    motherDateOfBirth: text("mother_date_of_birth"),
    employerName: text("employer_name"),
    employerAddress: text("employer_address"),
    employerEmailAddress: text("employer_email_address"),
    previouslyRefused: integer("previously_refused", {
      mode: "boolean",
    }).default(false),
    previouslyIssued: integer("previously_issued", { mode: "boolean" }).default(
      false,
    ),
  },
  (tbl) => [index("email_index").on(tbl.email)],
);

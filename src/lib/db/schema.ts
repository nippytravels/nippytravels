import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const role = pgEnum("role", ["user", "admin"]);

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

export const form = pgTable(
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
    previouslyRefused: boolean("previously_refused").default(false),
    previouslyIssued: boolean("previously_issued").default(false),
  },
  (tbl) => [index("email_index").on(tbl.email)],
);

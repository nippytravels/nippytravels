import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db/index";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
  trustedOrigins: [
    "https://nippytravels.com",
    "https://admin.nippytravels.com",
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".website.com",
    },
  },
});

export type Session = typeof auth.$Infer.Session;

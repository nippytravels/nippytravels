import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import Env from "@/env";
import { db } from "@/lib/db/index";
import * as schema from "@/lib/db/schema";

const isDev = process.env.NODE_ENV === "development";

export const auth = betterAuth({
  baseURL: Env.NEXT_PUBLIC_APP_URL,
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
    nextCookies(),
  ],
  trustedOrigins: [
    "https://nippytravels.com",
    "https://admin.nippytravels.com",
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: isDev ? undefined : ".nippytravels.com",
    },
  },
});

export type Session = typeof auth.$Infer.Session;

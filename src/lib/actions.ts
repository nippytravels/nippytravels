"use server";

import crypto from "node:crypto";
import { desc, eq, getTableColumns, type SQL, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import z from "zod";
import * as S from "@/lib/db/schema";
import { client } from "./action-client";
import { db } from "./db";
import { LoginSchema, type RequestValues, requestSchema } from "./validations";

const isDev = process.env.NODE_ENV === "development";

const { search: _search, ...formColumns } = getTableColumns(S.form);

const toPrefixQuery = (input: string): SQL | null => {
  const tokens = input.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (tokens.length === 0) return null;
  return sql`to_tsquery('english', ${tokens.map((t) => `${t}:*`).join(" & ")})`;
};

export const getForms = cache(
  async (page: number) =>
    await db.query.form.findMany({
      offset: (page - 1) * 20,
      limit: 20,
    }),
);

export const logout = client.action(async ({ ctx }) => {
  await ctx.auth.api.signOut({
    headers: await headers(),
  });

  return redirect("/login");
});

export const login = client
  .inputSchema(LoginSchema)
  .action(async ({ parsedInput, ctx }) => {
    console.log({ parsedInput });

    await ctx.auth.api.signInEmail({
      body: {
        email: parsedInput.email,
        password: parsedInput.password,
      },
    });

    return redirect(isDev ? "/admin" : "https://admin.nippytravels.com/admin");
  });

async function saveRequest(request: RequestValues) {
  // TODO: persist to your database and notify the owner

  const created = (
    await db
      .insert(S.form)
      .values({
        id: crypto.randomUUID().toString(),
        ...request,
      })
      .returning({
        email: S.form.email,
        firstName: S.form.firstName,
        lastName: S.form.lastName,
      })
  ).at(0);

  if (!created) throw new Error("Error saving form information");

  console.log({ created });
}

export const submitRequest = client
  .inputSchema(requestSchema)
  .action(async ({ parsedInput }) => {
    await saveRequest(parsedInput);
    return { success: true };
  });

export const deleteForm = client
  .inputSchema(
    z.object({
      formId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db.delete(S.form).where(eq(S.form.id, parsedInput.formId));

    return redirect("/admin/forms");
  });

export const searchForms = async (
  input: string,
  page: { limit: number; offset: number },
) => {
  const query = toPrefixQuery(input);
  if (!query) return [];

  const rank = sql<number>`ts_rank_cd(${S.form.search}, ${query})`.mapWith(
    Number,
  );

  return await db
    .select({ ...formColumns, rank })
    .from(S.form)
    .where(sql`${S.form.search} @@ ${query}`)
    .orderBy(desc(rank), desc(S.form.id))
    .limit(page.limit)
    .offset(page.offset);
};

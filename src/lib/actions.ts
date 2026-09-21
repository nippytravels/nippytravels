"use server";

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import z from "zod";
import * as S from "@/lib/db/schema";
import { client } from "./action-client";
import { db } from "./db";
import { FormSchema, LoginSchema } from "./validations";

const isDev = process.env.NODE_ENV === "development";

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

export const submitFormAction = client
  .inputSchema(FormSchema)
  .action(async ({ parsedInput }) => {
    console.log({ parsedInput });

    const created = (
      await db
        .insert(S.form)
        .values({
          id: crypto.randomUUID().toString(),
          // ...parsedInput.children,
          ...parsedInput.employerInfo,
          ...parsedInput.parents,
          ...parsedInput.personalInfo,
          ...parsedInput.spouse,
          ...parsedInput.visaInfo,
        })
        .returning({
          email: S.form.email,
          firstName: S.form.firstName,
          lastName: S.form.lastName,
        })
    ).at(0);

    if (!created) throw new Error("Error saving form information");

    console.log({ created });

    return {
      user: created,
    };
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

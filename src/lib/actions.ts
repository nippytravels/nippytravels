"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import * as S from "@/lib/db/schema";
import { client } from "./action-client";
import { db } from "./db";
import { FormSchema, LoginSchema } from "./validations";

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

    return redirect("/admin");
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

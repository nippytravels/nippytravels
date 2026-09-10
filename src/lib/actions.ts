"use server";

import crypto from "node:crypto";
import * as S from "@/lib/db/schema";
import { client } from "./action-client";
import { db } from "./db";
import { FormSchema } from "./validations";

export const submitFormAction = client
  .inputSchema(FormSchema)
  .action(async ({ parsedInput }) => {
    console.log({ parsedInput });

    const created = (
      await db
        .insert(S.form)
        .values({
          id: crypto.randomUUID(),
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

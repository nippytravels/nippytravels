"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import * as S from "@/lib/db/schema";
import { client } from "./action-client";
import { db } from "./db";
import * as Secure from "./secure";
import * as Utils from "./utils";
import { appointmentSchema, LoginSchema, requestSchema } from "./validations";

const isDev = process.env.NODE_ENV === "development";

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

    return redirect(
      isDev ? "/dashboard" : "https://admin.nippytravels.com/dashboard",
    );
  });

export const deleteForm = client
  .inputSchema(
    z.object({
      formId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db.delete(S.requests).where(eq(S.requests.id, parsedInput.formId));

    return redirect("/dashboard");
  });

function yesNo(value: string) {
  if (value !== "yes" && value !== "no") throw new Error("Invalid submission.");
  return value === "yes";
}

export const submitRequest = client
  .inputSchema(requestSchema)
  .action(async ({ parsedInput: v }) => {
    const status = (S.maritalStatus.enumValues as readonly string[]).includes(
      v.maritalStatus,
    )
      ? (v.maritalStatus as (typeof S.maritalStatus.enumValues)[number])
      : undefined;
    if (!status) throw new Error("Invalid submission.");

    const married = status === "married";
    const passportNumber = v.passportNumber.trim().toUpperCase();

    const values = {
      firstName: v.firstName.trim(),
      middleName: v.middleName?.trim() || null,
      lastName: v.lastName.trim(),
      dateOfBirth: Utils.toIsoDate(v.dateOfBirth),
      maritalStatus: status,
      spouseName: married ? (v.spouseName?.trim() ?? null) : null,
      spouseDateOfBirth:
        married && v.spouseDateOfBirth
          ? Utils.toIsoDate(v.spouseDateOfBirth)
          : null,
      passportNumberEnc: Secure.encrypt(passportNumber),
      passportLast4: passportNumber.slice(-4),
      passportIssueDate: Utils.toIsoDate(v.passportIssueDate),
      passportExpiryDate: Utils.toIsoDate(v.passportExpiryDate),
      homeAddress: v.homeAddress.trim(),
      phone: v.phone.trim(),
      email: v.email.trim().toLowerCase(),
      employerName: v.employerName.trim(),
      employerAddress: v.employerAddress.trim(),
      employerEmail: v.employerEmail.trim().toLowerCase(),
      motherName: v.motherName.trim(),
      motherDateOfBirth: Utils.toIsoDate(v.motherDateOfBirth),
      fatherName: v.fatherName.trim(),
      fatherDateOfBirth: Utils.toIsoDate(v.fatherDateOfBirth),
      visaRefused: yesNo(v.visaRefused),
      visaIssued: yesNo(v.visaIssued),
    };

    const children = v.children.map((c, position) => ({
      fullName: c.fullName.trim(),
      dateOfBirth: Utils.toIsoDate(c.dateOfBirth),
      position,
    }));

    const created = await db.transaction(async (tx) => {
      const [row] = await tx.insert(S.requests).values(values).returning({
        id: S.requests.id,
        referenceNumber: S.requests.referenceNumber,
      });
      if (children.length > 0) {
        await tx
          .insert(S.requestChildren)
          .values(children.map((c) => ({ ...c, requestId: row.id })));
      }
      return row;
    });

    // TODO: notify the owner (email or push) that a new request arrived
    // NODEMAILER IS PROBABLY A BETTER OPTION, COST WISE

    return {
      reference: `NT-${String(created.referenceNumber).padStart(4, "0")}`,
    };
  });

export const bookAppointment = client
  .inputSchema(appointmentSchema)
  .action(async ({ parsedInput: v }) => {
    const email = v.email.trim().toLowerCase();

    const [row] = await db
      .insert(S.appointments)
      .values({
        email,
        destination: v.destination.trim(),
        travelDate: Utils.toIsoDate(v.date),
      })
      .returning({ referenceNumber: S.appointments.referenceNumber });

    // TODO: notify the owner (email or push) that a new appointment request arrived

    return {
      email,
      reference: `AP-${String(row.referenceNumber).padStart(4, "0")}`,
    };
  });

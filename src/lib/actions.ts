"use server";

import { createCipheriv, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import * as S from "@/lib/db/schema";
import { client } from "./action-client";
import { db } from "./db";
import { LoginSchema, requestSchema } from "./validations";

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

    return redirect(isDev ? "/admin" : "https://admin.nippytravels.com/admin");
  });

export const deleteForm = client
  .inputSchema(
    z.object({
      formId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db.delete(S.requests).where(eq(S.requests.id, parsedInput.formId));

    return redirect("/admin");
  });

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Date columns are yyyy-MM-dd. The date picker currently sends either that or
// Date.toString() output ("Tue Mar 14 1991 00:00:00 GMT+0100 ..."), so read the calendar
// date exactly as it was picked instead of converting through the server's time zone.
function toIsoDate(value: string) {
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (iso) return iso[1];

  const str = /^\w{3} (\w{3}) (\d{1,2}) (\d{4})/.exec(value);
  const month = str ? MONTHS.indexOf(str[1]) : -1;
  if (str && month >= 0) {
    return `${str[3]}-${String(month + 1).padStart(2, "0")}-${str[2].padStart(2, "0")}`;
  }

  throw new Error("One of the dates is not valid.");
}

// AES-256-GCM, stored as base64(iv):base64(authTag):base64(ciphertext)
// Generate a key with: openssl rand -base64 32  (set it as PASSPORT_ENCRYPTION_KEY)
function encrypt(plain: string) {
  const key = Buffer.from(process.env.PASSPORT_ENCRYPTION_KEY ?? "", "base64");
  if (key.length !== 32)
    throw new Error("PASSPORT_ENCRYPTION_KEY must be 32 bytes, base64 encoded");

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data]
    .map((b) => b.toString("base64"))
    .join(":");
}

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

    // Convert and check everything before opening the transaction
    const values = {
      firstName: v.firstName.trim(),
      middleName: v.middleName?.trim() || null,
      lastName: v.lastName.trim(),
      dateOfBirth: toIsoDate(v.dateOfBirth),
      maritalStatus: status,
      spouseName: married ? (v.spouseName?.trim() ?? null) : null,
      spouseDateOfBirth:
        married && v.spouseDateOfBirth ? toIsoDate(v.spouseDateOfBirth) : null,

      passportNumberEnc: encrypt(passportNumber),
      passportLast4: passportNumber.slice(-4),
      passportIssueDate: toIsoDate(v.passportIssueDate),
      passportExpiryDate: toIsoDate(v.passportExpiryDate),

      homeAddress: v.homeAddress.trim(),
      phone: v.phone.trim(),
      email: v.email.trim().toLowerCase(),

      employerName: v.employerName.trim(),
      employerAddress: v.employerAddress.trim(),
      employerEmail: v.employerEmail.trim().toLowerCase(),

      motherName: v.motherName.trim(),
      motherDateOfBirth: toIsoDate(v.motherDateOfBirth),
      fatherName: v.fatherName.trim(),
      fatherDateOfBirth: toIsoDate(v.fatherDateOfBirth),

      visaRefused: yesNo(v.visaRefused),
      visaIssued: yesNo(v.visaIssued),
    };

    const children = v.children.map((c, position) => ({
      fullName: c.fullName.trim(),
      dateOfBirth: toIsoDate(c.dateOfBirth),
      position,
    }));

    // The request and its children are saved together or not at all
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

    return {
      reference: `NT-${String(created.referenceNumber).padStart(4, "0")}`,
    };
  });

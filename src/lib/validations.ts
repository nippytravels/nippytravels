import { z } from "zod";

const phoneNumber = z
  .string()
  .regex(
    /^(?:0[789]\d{9}|\+234[789]\d{9})$/,
    "Enter a valid Nigerian phone number",
  );

const passportNumber = z
  .string()
  .regex(/^[A-Z]\d{8}$/, "Enter a valid Nigerian passport number");

export const FormSchema = z.object({
  personalInfo: z.object({
    firstName: z.string(),
    middleName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    passportNumber,
    passportIssueDate: z.string(),
    passportExpiry: z.string(),
    maritalStatus: z.enum(["single", "married", "divorced"]),
    phoneNumber,
    email: z.email(),
  }),
  spouse: z
    .object({
      spouseName: z.string().optional(),
      spouseDateOfBirth: z.string().optional(),
    })
    .optional(),
  parents: z.object({
    motherFullName: z.string(),
    motherDateOfBirth: z.string(),
    fatherFullName: z.string(),
    fatherDateOfBirth: z.string(),
  }),
  children: z.array(
    z.object({
      fullName: z.string(),
      dateOfBirth: z.string(),
    }),
  ),
  employerInfo: z.object({
    employerName: z.string(),
    employerAddress: z.string(),
    employerEmailAddress: z.email(),
  }),
  visaInfo: z.object({
    previouslyRefused: z.boolean().default(false),
    previouslyIssued: z.boolean().default(false),
  }),
});

export type FormData = z.infer<typeof FormSchema>;

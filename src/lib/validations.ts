import { z } from "zod";

const phoneNumber = z
  .string()
  .regex(
    /^(?:0[789]\d{9}|\+234[789]\d{9})$/,
    "Enter a valid Nigerian phone number",
  );

const passportNumber = z
  .string("Passport Number is required")
  .regex(/^[A-Z]\d{8}$/, "Enter a valid passport number");

export const FormSchema = z.object({
  personalInfo: z.object({
    firstName: z.string("First Name is required"),
    middleName: z.string().optional(),
    lastName: z.string("Last Name is required"),
    dateOfBirth: z.string("Date Of Birth is required"),
    passportNumber,
    passportIssueDate: z.string("Issue Date is required"),
    passportExpiry: z.string("Please enter a valid"),
    maritalStatus: z.enum(["single", "married", "divorced"]).default("single"),
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
  children: z
    .array(
      z.object({
        fullName: z.string(),
        dateOfBirth: z.string(),
      }),
    )
    .optional(),
  employerInfo: z.object({
    employerName: z.string("Employer Name is required"),
    employerAddress: z.string("Employer Address is required"),
    employerEmailAddress: z.email("Employer Email is required"),
  }),
  visaInfo: z.object({
    previouslyRefused: z.boolean().default(false),
    previouslyIssued: z.boolean().default(false),
  }),
});

export const LoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type FormData = z.infer<typeof FormSchema>;

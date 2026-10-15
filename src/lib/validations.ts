import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const QuoteSchema = z.object({
  destination: z.string(),
  travelDate: z.string(),
  email: z.email(),
});

// Shared by the client form and the server action, so it must not live in a "use server" file
const required = (message: string) => z.string().trim().min(1, message);

export const personalSchema = z.object({
  firstName: required("Enter your first name"),
  middleName: z.string().trim().optional(),
  lastName: required("Enter your last name"),
  dateOfBirth: required("Select your date of birth"),
  maritalStatus: required("Select your marital status"),
  spouseName: z.string().trim().optional(),
  spouseDateOfBirth: z.string().optional(),
});

export const passportSchema = z.object({
  passportNumber: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{6,12}$/, "Enter a valid passport number"),
  passportIssueDate: required("Select the issue date"),
  passportExpiryDate: required("Select the expiry date"),
});

export const contactSchema = z.object({
  homeAddress: required("Enter your home address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{7,20}$/, "Enter a valid phone number"),
  email: z.email("Enter a valid email"),
  employerName: required("Enter your employer's name"),
  employerAddress: required("Enter your employer's address"),
  employerEmail: z.email("Enter a valid employer email"),
});

export const familySchema = z.object({
  motherName: required("Enter your mother's full name"),
  motherDateOfBirth: required("Select your mother's date of birth"),
  fatherName: required("Enter your father's full name"),
  fatherDateOfBirth: required("Select your father's date of birth"),
  children: z.array(
    z.object({
      fullName: required("Enter the child's full name"),
      dateOfBirth: required("Select the child's date of birth"),
    }),
  ),
});

export const visaSchema = z.object({
  visaRefused: required("Please select an option"),
  visaIssued: required("Please select an option"),
});

const toTime = (value?: string) => {
  const t = Date.parse(value ?? "");
  return Number.isNaN(t) ? undefined : t;
};

// Full schema with the rules that span steps or depend on other answers
export const requestSchema = z
  .object({
    ...personalSchema.shape,
    ...passportSchema.shape,
    ...contactSchema.shape,
    ...familySchema.shape,
    ...visaSchema.shape,
  })
  .superRefine((v, ctx) => {
    if (v.maritalStatus === "married") {
      if (!v.spouseName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["spouseName"],
          message: "Enter your spouse's full name",
        });
      }
      if (!v.spouseDateOfBirth) {
        ctx.addIssue({
          code: "custom",
          path: ["spouseDateOfBirth"],
          message: "Select your spouse's date of birth",
        });
      }
    }

    const issued = toTime(v.passportIssueDate);
    const expires = toTime(v.passportExpiryDate);
    if (issued && expires && expires <= issued) {
      ctx.addIssue({
        code: "custom",
        path: ["passportExpiryDate"],
        message: "Expiry must be after the issue date",
      });
    } else if (expires && expires < Date.now()) {
      ctx.addIssue({
        code: "custom",
        path: ["passportExpiryDate"],
        message: "This passport has expired",
      });
    }
  });

export type RequestValues = z.infer<typeof requestSchema>;

export const emptyValues: RequestValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  maritalStatus: "",
  spouseName: "",
  spouseDateOfBirth: "",
  passportNumber: "",
  passportIssueDate: "",
  passportExpiryDate: "",
  homeAddress: "",
  phone: "",
  email: "",
  employerName: "",
  employerAddress: "",
  employerEmail: "",
  motherName: "",
  motherDateOfBirth: "",
  fatherName: "",
  fatherDateOfBirth: "",
  children: [],
  visaRefused: "",
  visaIssued: "",
};

export const appointmentSchema = z.object({
  destination: z.string().trim().min(1, "Enter a destination"),
  date: z.string().min(1, "Pick a travel date"),
  email: z.email("Enter a valid email"),
});

export type AppointmentValues = z.infer<typeof appointmentSchema>;

export const appointmentDefaults: AppointmentValues = {
  destination: "",
  date: "",
  email: "",
};

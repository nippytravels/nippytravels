"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { useWatch } from "react-hook-form";
import { FormInput } from "@/components/atoms";
import { MultiStep, useMultiStepForm } from "@/components/multistep";
import { submitRequest } from "@/lib/actions";
import {
  contactSchema,
  emptyValues,
  familySchema,
  passportSchema,
  personalSchema,
  type RequestValues,
  requestSchema,
  visaSchema,
} from "@/lib/validations";

const maritalOptions = [
  { name: "Single", value: "single" },
  { name: "Married", value: "married" },
  { name: "Divorced", value: "divorced" },
  { name: "Widowed", value: "widowed" },
];

const yesNoOptions = [
  { name: "Yes", value: "yes" },
  { name: "No", value: "no" },
];

/* ------------------------------- Step content ------------------------------- */

function StepHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-[26px] tracking-[-0.01em] text-ink md:text-[30px]">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-stone">{hint}</p>
    </div>
  );
}

function Fields({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div
      className={`grid gap-5 md:gap-x-6 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
    >
      {children}
    </div>
  );
}

function PersonalFields() {
  const { control } = useMultiStepForm<RequestValues>();
  const status = useWatch({ control, name: "maritalStatus" });

  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        title="Personal details"
        hint="Your full legal name and date of birth, as they appear in your passport."
      />
      <Fields cols={3}>
        <FormInput control={control} name="firstName" label="First name" />
        <FormInput
          control={control}
          name="middleName"
          label="Middle name (optional)"
        />
        <FormInput control={control} name="lastName" label="Last name" />
      </Fields>
      <Fields>
        <FormInput
          control={control}
          name="dateOfBirth"
          label="Date of birth"
          type="date"
          placeholder="Pick a date"
        />
        <FormInput
          control={control}
          name="maritalStatus"
          label="Marital status"
          type="select"
          options={maritalOptions}
        />
      </Fields>
      {status === "married" && (
        <Fields>
          <FormInput
            control={control}
            name="spouseName"
            label="Spouse's full name"
          />
          <FormInput
            control={control}
            name="spouseDateOfBirth"
            label="Spouse's date of birth"
            type="date"
            placeholder="Pick a date"
          />
        </Fields>
      )}
    </div>
  );
}

function PassportFields() {
  const { control } = useMultiStepForm<RequestValues>();
  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        title="Passport"
        hint="Check these against the data page of your passport."
      />
      <FormInput
        control={control}
        name="passportNumber"
        label="Passport number"
      />
      <Fields>
        <FormInput
          control={control}
          name="passportIssueDate"
          label="Issue date"
          type="date"
          placeholder="Pick a date"
        />
        <FormInput
          control={control}
          name="passportExpiryDate"
          label="Expiry date"
          type="date"
          placeholder="Pick a date"
        />
      </Fields>
    </div>
  );
}

function ContactFields() {
  const { control } = useMultiStepForm<RequestValues>();
  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        title="Contact and employment"
        hint="How we can reach you, and where you work."
      />
      <FormInput
        control={control}
        name="homeAddress"
        label="Home address"
        placeholder="Street, city, state, country"
      />
      <Fields>
        <FormInput
          control={control}
          name="phone"
          label="Phone number"
          placeholder="+234 801 234 5678"
        />
        <FormInput
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
        />
      </Fields>
      <div className="mt-3 border-t border-sand-300 pt-6">
        <p className="mb-5 text-sm font-semibold text-ink">Employer</p>
        <div className="flex flex-col gap-5">
          <FormInput
            control={control}
            name="employerName"
            label="Employer name"
          />
          <FormInput
            control={control}
            name="employerAddress"
            label="Employer address"
          />
          <FormInput
            control={control}
            name="employerEmail"
            label="Employer email"
            placeholder="hr@company.com"
          />
        </div>
      </div>
    </div>
  );
}

function FamilyFields() {
  const { control } = useMultiStepForm<RequestValues>();
  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        title="Family"
        hint="Full names as they appear on official documents."
      />
      <Fields>
        <FormInput
          control={control}
          name="motherName"
          label="Mother's full name"
        />
        <FormInput
          control={control}
          name="motherDateOfBirth"
          label="Mother's date of birth"
          type="date"
          placeholder="Pick a date"
        />
        <FormInput
          control={control}
          name="fatherName"
          label="Father's full name"
        />
        <FormInput
          control={control}
          name="fatherDateOfBirth"
          label="Father's date of birth"
          type="date"
          placeholder="Pick a date"
        />
      </Fields>
      <div className="mt-3 border-t border-sand-300 pt-6">
        <FormInput
          control={control}
          name="children"
          label="Children (leave empty if none)"
          type="array"
          itemFields={[
            { name: "fullName", label: "Full name", type: "text" },
            {
              name: "dateOfBirth",
              label: "Date of birth",
              type: "date",
              placeholder: "Pick a date",
            },
          ]}
        />
      </div>
    </div>
  );
}

function VisaFields() {
  const { control } = useMultiStepForm<RequestValues>();
  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        title="Visa history"
        hint="Please answer both questions honestly."
      />
      <Fields>
        <FormInput
          control={control}
          name="visaRefused"
          label="Have you ever been refused any visa?"
          type="select"
          options={yesNoOptions}
        />
        <FormInput
          control={control}
          name="visaIssued"
          label="Have you ever been issued any visa?"
          type="select"
          options={yesNoOptions}
        />
      </Fields>
    </div>
  );
}

/* ----------------------------------- Page ----------------------------------- */

function RequestForm() {
  const params = useSearchParams();

  // The landing page quote form passes the email through the query string
  const initialData: RequestValues = {
    ...emptyValues,
    email: params.get("email") ?? "",
  };

  // react-hook-form bound to the safe action; server validation errors are mapped onto the fields
  const { form, action } = useHookFormAction(
    submitRequest,
    zodResolver(requestSchema),
    {
      formProps: { mode: "onChange", defaultValues: initialData },
    },
  );

  if (action.hasSucceeded) {
    return (
      <div className="rounded-[20px] border border-sand-300 bg-white p-8 text-center md:p-14">
        <h2 className="font-display text-[34px] leading-[1.1] tracking-[-0.015em] text-ink md:text-[40px]">
          Request received
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-[1.7] text-stone">
          Thank you. We have your details and will be in touch about your
          request.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-full border border-sand-400 px-7 text-base font-semibold text-ink transition hover:bg-sand-100"
        >
          Back to website
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-sand-300 bg-white p-6 shadow-[0_20px_50px_rgba(26,46,32,0.05)] md:p-10">
      <MultiStep.Root<RequestValues>
        form={form}
        rootSchema={requestSchema}
        onSubmit={async (data) => {
          await action.executeAsync(data);
        }}
      >
        <MultiStep.Step id="personal" title="Personal" schema={personalSchema}>
          <PersonalFields />
        </MultiStep.Step>
        <MultiStep.Step id="passport" title="Passport" schema={passportSchema}>
          <PassportFields />
        </MultiStep.Step>
        <MultiStep.Step id="contact" title="Contact" schema={contactSchema}>
          <ContactFields />
        </MultiStep.Step>
        <MultiStep.Step id="family" title="Family" schema={familySchema}>
          <FamilyFields />
        </MultiStep.Step>
        <MultiStep.Step id="visa" title="Visa history" schema={visaSchema}>
          <VisaFields />
        </MultiStep.Step>
      </MultiStep.Root>
      {action.result.serverError && (
        <p
          role="alert"
          className="mt-4 text-center text-sm font-medium text-clay-800"
        >
          {action.result.serverError}
        </p>
      )}
    </div>
  );
}

export default function RequestPage() {
  return (
    <>
      <header className="mx-auto flex h-20 w-full items-center justify-between px-8 md:h-22">
        <Link
          href="/"
          className="font-display text-[22px] tracking-tight text-ink md:text-2xl"
        >
          Nippy Travels
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-ink underline decoration-sand-400 underline-offset-4 hover:decoration-clay"
        >
          ← Back to website
        </Link>
      </header>
      <main className="mx-auto w-5/6 px-6 pb-24 pt-10 md:px-8 md:pt-14">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-stone md:text-[13px]">
          Visa assistance
        </p>
        <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.025em] text-ink md:text-[56px]">
          Tell us about <em className="not-italic text-clay">yourself.</em>
        </h1>
        <p className="mb-10 mt-5 max-w-[560px] text-[17px] leading-relaxed text-stone md:mb-12">
          Fill in each step exactly as it appears in your passport and
          documents.
        </p>
        <Suspense>
          <RequestForm />
        </Suspense>
      </main>
    </>
  );
}

import { Collapsible } from "@base-ui/react/collapsible";
import { AltArrowDown } from "@solar-icons/react/ssr";
import moment from "moment";
import React from "react";
import { db } from "@/lib/db";
import type * as S from "@/lib/db/schema";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function FormsView({ searchParams }: Props) {
  const params = await searchParams;
  const page = +(params.page ?? "1");

  const forms = await db.query.form.findMany({
    offset: (page - 1) * 20,
    limit: 20,
    orderBy: (fields, { desc }) => desc(fields.createdAt),
  });

  if (forms.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-2xl text-neutral-500 font-bold">
          No Filled Forms Right Now
        </h1>
      </div>
    );
  }

  return (
    <div>
      {forms.map((form) => (
        <FormItem form={form} key={form.id} />
      ))}
    </div>
  );
}

const FormItem = React.memo(
  ({ form }: { form: typeof S.form.$inferSelect }) => {
    return (
      <Collapsible.Root className="w-full border-b border-b-solid border-b-neutral-200">
        <div className="flex items-center justify-between px-3 py-5">
          <div className="flex flex-col items-start justify-centere">
            <span className="uppercase font-bold text-sm">
              {form.firstName} {form.lastName}
            </span>
            {form.createdAt && (
              <span className="uppercase text-xs text-neutral-400 font-medium">
                {moment(form.createdAt).fromNow()}
              </span>
            )}
          </div>
          <Collapsible.Trigger className="border border-solid border-neutral-200 flex items-center justify-center p-1.25">
            <AltArrowDown size={12} weight="Linear" />
          </Collapsible.Trigger>
        </div>
        <Collapsible.Panel className="px-5 py-3 border-t border-t-solid border-t-neutral-200 flex flex-col justify-end overflow-hidden transition-[height] duration-50 ease-[ease-out] [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0">
          <div className="flex flex-col items-start justify-center gap-3">
            <h1 className="uppercase font-bold">Personal Information</h1>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">{form.firstName}</span>
              <span className="input">{form.middleName}</span>
              <span className="input">{form.lastName}</span>
            </div>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">{new Date(form.dateOfBirth!).toLocaleString()}</span>
              <span className="input">{form.passportNumber}</span>
              <span className="input">{new Date(form.passportIssueDate!).toLocaleString()}</span>
            </div>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">{new Date(form.passportExpiry!).toLocaleString()}</span>
              <span className="input uppercase">{form.maritalStatus}</span>
              <span className="input">{form.phoneNumber}</span>
            </div>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">{form.email}</span>
            </div>
          </div>
          <div className="flex my-3 flex-col items-start justify-center gap-3">
            <h1 className="uppercase font-bold">Family Information</h1>
            {form.spouseName && form.spouseDateOfBirth && (
              <div className="w-full flex items-center justify-start gap-3">
                <span className="input">{form.spouseName}</span>
                <span className="input">{form.spouseDateOfBirth}</span>
              </div>
            )}
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">
                Mothers Full Name:
                <span className="font-bold uppercase">
                  {form.motherFullName}
                </span>
              </span>
              <span className="input">
                Mothers Date Of Birth:{" "}
                <span className="font-bold uppercase">
                  {form.motherDateOfBirth}
                </span>
              </span>
            </div>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">
                Fathers Full Name:{" "}
                <span className="font-bold uppercase">
                  {form.fatherFullName}
                </span>
              </span>
              <span className="input">
                Fathers Date Of Birth:{" "}
                <span className="font-bold uppercase">
                  {form.fatherDateOfBirth}
                </span>
              </span>
            </div>
          </div>
          <div className="flex my-3 flex-col items-start justify-center gap-3">
            <h1 className="uppercase font-bold">Employer Information</h1>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">
                Employer Name:
                <span className="font-bold uppercase">{form.employerName}</span>
              </span>
              <span className="input">
                Employer Email Address:
                <span className="font-bold uppercase">
                  {form.employerEmailAddress}
                </span>
              </span>
            </div>
            <span className="input">
              Employer Address:
              <span className="font-bold uppercase">
                {form.employerAddress}
              </span>
            </span>
          </div>
          <div className="flex my-3 flex-col items-start justify-center gap-3">
            <h1 className="uppercase font-bold">Visa Information</h1>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">
                Previously Issued: 
                <span className={`font-bold uppercase mx-2 ${form.previouslyIssued?"text-red-500":"text-green-500"}`}>
                  {String(form.previouslyIssued?.valueOf())}
                </span>
              </span>
              <span className="input">
                Previously Refused:
                <span className={`font-bold uppercase mx-2 ${form.previouslyRefused?"text-red-500":"text-green-500"}`}>
                  {String(form.previouslyRefused?.valueOf())}
                </span>
              </span>
            </div>
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  },
);

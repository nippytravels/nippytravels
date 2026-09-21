"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { AltArrowDown, TrashBinMinimalistic } from "@solar-icons/react/ssr";
import moment from "moment";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { toast } from "sonner";
import { deleteForm } from "@/lib/actions";
import type * as S from "@/lib/db/schema";
import { Spinner } from "./atoms";

const FormItem = React.memo(
  ({ form }: { form: typeof S.form.$inferSelect }) => {
    const { execute, isExecuting } = useAction(deleteForm, {
      onSuccess: () => toast.success("Form Deleted Successfully"),
    });

    return (
      <Collapsible.Root className="w-full border border-solid border-neutral-200 rounded-md corner-squircle">
        <div className="flex items-center justify-between px-3 py-3">
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
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => execute({ formId: form.id })}
              className="p-1.25 border border-solid border-red-200 text-red-500 bg-red-50 rounded-md corner-squircle"
            >
              {isExecuting ? (
                <Spinner size={10} color="#FB2C36" />
              ) : (
                <TrashBinMinimalistic size={14} weight="Bold" />
              )}
            </button>
            <Collapsible.Trigger className="border border-solid border-neutral-200 flex items-center bg-neutral-50 hover:bg-neutral-100 rounded-md corner-squircle justify-center p-1.25">
              <AltArrowDown size={14} weight="Linear" />
            </Collapsible.Trigger>
          </div>
        </div>
        <Collapsible.Panel className="px-3 py-3 border-t border-t-solid border-t-neutral-200 flex flex-col gap-3 justify-end overflow-hidden transition-[height] duration-50 ease-[ease-out] [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0">
          <div className="flex flex-col items-start justify-center gap-3">
            <h1 className="uppercase font-bold">Personal Information</h1>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">{form.firstName}</span>
              <span className="input">{form.middleName}</span>
              <span className="input">{form.lastName}</span>
            </div>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">
                {new Date(form.dateOfBirth!).toLocaleString()}
              </span>
              <span className="input">{form.passportNumber}</span>
              <span className="input">
                {new Date(form.passportIssueDate!).toLocaleString()}
              </span>
            </div>
            <div className="w-full flex items-center justify-start gap-3">
              <span className="input">
                {new Date(form.passportExpiry!).toLocaleString()}
              </span>
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
                <span
                  className={`font-bold uppercase mx-2 ${form.previouslyIssued ? "text-red-500" : "text-green-500"}`}
                >
                  {String(form.previouslyIssued?.valueOf())}
                </span>
              </span>
              <span className="input">
                Previously Refused:
                <span
                  className={`font-bold uppercase mx-2 ${form.previouslyRefused ? "text-red-500" : "text-green-500"}`}
                >
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

export default FormItem;

"use client";

import { Dialog } from "@base-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { CloseCircle } from "@solar-icons/react/ssr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { submitFormAction } from "@/lib/actions";
import { type FormData, FormSchema } from "@/lib/validations";
import { FormInput, Switch } from "./atoms";
import { MultiStep } from "./multistep";

type RootProps = {
  children: React.ReactNode;
};

type ActiveView = "about" | "form";

export default function Root(props: RootProps) {
  const router = useRouter();
  const pathname = usePathname();

  const dialogTriggerRef = React.useRef<HTMLButtonElement>(null);
  const searchParams = useSearchParams();
  const viewing = searchParams.get("viewing");
  const [activeView, setActiveView] = React.useState<ActiveView>("about");

  React.useEffect(() => {
    if (viewing === "about") {
      setActiveView("about");
      dialogTriggerRef.current?.click();
    }
    if (viewing === "form") {
      setActiveView("form");
      dialogTriggerRef.current?.click();
    }
  }, [viewing]);

  const closeDialog = React.useCallback(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete("viewing");
    const newUrl = currentParams.toString()
      ? `${pathname}?${currentParams.toString()}`
      : pathname;
    router.push(newUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <>
      {props.children}
      <Dialog.Root>
        <Dialog.Trigger ref={dialogTriggerRef} />
        <Dialog.Portal className="z-30">
          <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-15 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
          <Dialog.Popup className="fixed bg-neutral-200 backdrop-blur-lg noise-subtle top-1/2 left-1/2 -mt-8 flex flex-col w-[90%] max-h-125 md:lg:xl:w-4/6 overflow-hidden md:lg:xl:max-w-[calc(100vw-3rem)] md:lg:xl:max-h-[calc(90vh-3rem)] -translate-x-1/2 rounded-lg corner-squircle -translate-y-1/2 text-neutral-950 border border-neutral-300 shadow shadow-black/20 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            <div className="overflow-y-auto flex-1 py-6 px-6 pt-12 pb-8 md:px-10">
              <Switch value={activeView}>
                {{
                  about: <AboutView />,
                  form: <FormView />,
                  default: () => null,
                }}
              </Switch>
            </div>
            <Dialog.Close
              onClick={closeDialog}
              className="flex fixed z-1 right-5 top-4 text-red-800 items-center justify-center"
            >
              <CloseCircle weight="Bold" size={30} />
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

const AboutView = React.memo(() => {
  return (
    <div className="w-full h-full flex overflow-hidden">
      <div className="w-4/6 flex flex-col items-start text-sm text-neutral-600 justify-start text-start h-full border-r border-solid border-r-neutral-200 overflow-y-scroll overflow-x-hidden">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae,
          recusandae! Consequuntur animi nostrum tempore quis quia, ipsam quas
          voluptates ut. Illum quo voluptates placeat molestiae porro natus
          facilis quae cumque!
        </p>
      </div>
      <div className="w-2/6 h-full flex flex-col items-center justify-center"></div>
    </div>
  );
});

const FormView = React.memo(() => {
  const { action } = useHookFormAction(
    submitFormAction,
    zodResolver(FormSchema),
    {
      formProps: {
        mode: "onChange",
      },
    },
  );

  return (
    <div className="flex flex-col items-start justify-start gap-3">
      <h1 className="text-2xl font-bold">Preliminary Form</h1>
      <MultiStep.Root
        className="w-full h-full"
        onSubmit={action.execute}
        rootSchema={FormSchema}
      >
        <MultiStep.Step
          id="personalInfo"
          title="Personal Info"
          schema={FormSchema.pick({ personalInfo: true })}
        >
          <PersonalInformation />
        </MultiStep.Step>
        <MultiStep.Step
          id="parents"
          title="Parents Information"
          schema={FormSchema.pick({ parents: true })}
        >
          <ParentsInformation />
        </MultiStep.Step>
        <MultiStep.Step
          id="family"
          title="Family Information"
          schema={FormSchema.pick({ spouse: true, children: true })}
        >
          <SpouseInformation />
        </MultiStep.Step>
      </MultiStep.Root>
    </div>
  );
});

function PersonalInformation() {
  const { control } = MultiStep.useMultiStepForm<FormData>();

  return (
    <div className="w-full h-full gap-3">
      <div className="flex flex-col md:lg:xl:flex-row items-center justify-between gap-3 mb-2">
        <FormInput
          control={control}
          name="personalInfo.firstName"
          label="First Name"
        />
        <FormInput
          control={control}
          name="personalInfo.middleName"
          label="Middle Name"
        />
        <FormInput
          control={control}
          name="personalInfo.lastName"
          label="Last Name"
        />
      </div>
      <div className="flex flex-col md:lg:xl:flex-row items-center justify-between gap-3 mb-2">
        <FormInput
          control={control}
          name="personalInfo.dateOfBirth"
          label="Date Of Birth"
          type="date"
        />
        <FormInput control={control} name="personalInfo.email" label="Email" />
        <FormInput
          control={control}
          name="personalInfo.phoneNumber"
          label="Phone Number"
        />
      </div>
      <div className="flex flex-col md:lg:xl:flex-row items-center justify-between gap-3 mb-2">
        <FormInput
          control={control}
          name="personalInfo.passportNumber"
          label="Passport Number"
        />
        <FormInput
          control={control}
          name="personalInfo.passportIssueDate"
          label="Passport Issue Date"
          type="date"
        />
        <FormInput
          control={control}
          name="personalInfo.passportExpiry"
          label="Passport Expiry"
          type="date"
        />
      </div>
      <FormInput
        control={control}
        name="personalInfo.maritalStatus"
        label="Marital Status"
        type="select"
        options={[
          { name: "Single", value: "single" },
          { name: "Married", value: "married" },
          { name: "Divorced", value: "divorced" },
        ]}
      />
    </div>
  );
}

function ParentsInformation() {
  const { control } = MultiStep.useMultiStepForm<FormData>();

  return (
    <div className="w-full h-full gap-3">
      <div className="flex flex-col md:lg:xl:flex-row items-center justify-between gap-3 mb-2">
        <FormInput
          control={control}
          name="parents.fatherFullName"
          label="Fathers Full Name"
        />
        <FormInput
          control={control}
          name="parents.fatherDateOfBirth"
          label="Fathers Date Of Birth"
          type="date"
        />
      </div>
      <div className="flex flex-col md:lg:xl:flex-row items-center justify-between gap-3 mb-2">
        <FormInput
          control={control}
          name="parents.motherFullName"
          label="Mothers Full Name"
        />
        <FormInput
          control={control}
          name="parents.motherDateOfBirth"
          label="Mothers Date Of Birth"
          type="date"
        />
      </div>
    </div>
  );
}

function SpouseInformation() {
  const { control } = MultiStep.useMultiStepForm<FormData>();

  return (
    <div className="w-full h-full gap-3">
      <div className="flex flex-col md:lg:xl:flex-row items-center justify-between gap-3 mb-2">
        <FormInput
          control={control}
          name="spouse.spouseName"
          label="Spouse Full Name"
        />
        <FormInput
          control={control}
          name="spouse.spouseDateOfBirth"
          label="Spouse Date Of Birth"
          type="date"
        />
      </div>
      <FormInput
        control={control}
        name="children"
        label="Children"
        type="array"
        itemFields={[
          { name: "fullName", label: "Full Name" },
          { name: "dateOfBirth", label: "Date Of Birth" },
        ]}
      />
    </div>
  );
}

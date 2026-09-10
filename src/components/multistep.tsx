"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AltArrowLeft,
  AltArrowRight,
  CheckCircle,
} from "@solar-icons/react/ssr";
import type React from "react";
import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import Spinner from "./atoms/spinner";

export type StepProps<TFullData extends FieldValues> = {
  id: string;
  title: string;
  schema: z.ZodType<Partial<TFullData>>;
  children: ReactNode;
};

export type MultiStepContextValue<TFullData extends FieldValues> = {
  // navigation
  currentStepIndex: number;
  totalSteps: number;
  steps: { id: string; title: string }[];
  nextStep: () => Promise<void>;
  prevStep: () => void;
  goToStep: (index: number) => void;
  // Hook Form
  form: UseFormReturn<TFullData>;
  register: UseFormReturn<TFullData>["register"];
  setValue: UseFormReturn<TFullData>["setValue"];
  getValues: UseFormReturn<TFullData>["getValues"];
  trigger: UseFormReturn<TFullData>["trigger"];
  formState: UseFormReturn<TFullData>["formState"];
  control: UseFormReturn<TFullData>["control"];
  currentStepErrors: Record<string, string | undefined>;
};

const MultiStepContext = createContext<MultiStepContextValue<any> | null>(null);

export function useMultiStepForm<TFullData extends FieldValues>() {
  const context = useContext(MultiStepContext);
  if (!context) {
    throw new Error("useMultiStepForm must be used within <MultiStep.Root>");
  }
  return context as MultiStepContextValue<TFullData>;
}

// ============================================
// Helper: Merge partial schemas into one full schema
// ============================================
function mergePartialSchemas<TFullData extends FieldValues>(
  schemas: z.ZodType<Partial<TFullData>>[],
): z.ZodType<TFullData> {
  let shape: Record<string, z.ZodTypeAny> = {};
  for (const schema of schemas) {
    if (schema instanceof z.ZodObject) {
      shape = { ...shape, ...schema.shape };
    }
  }
  return z.object(shape) as unknown as z.ZodType<TFullData>;
}

export type RootProps<TFullData extends FieldValues> = {
  form?: UseFormReturn<TFullData>;
  rootSchema?: z.ZodType<TFullData>;
  initialData?: Partial<TFullData>;
  onSubmit: (data: TFullData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  submitButtonText?: string;
};

export function Root<TFullData extends FieldValues>({
  form: externalForm,
  rootSchema,
  initialData = {},
  children,
  className = "",
  showNavigation = true,
  onSubmit,
}: RootProps<TFullData>) {
  // Extract Step components from children
  const steps = Children.toArray(children).filter(
    (child) => isValidElement(child) && (child.type as any) === Step,
  ) as React.ReactElement<StepProps<TFullData>>[];

  const stepConfigs = steps.map((step) => {
    const schema = step.props.schema as z.ZodObject<any>;
    return {
      id: step.props.id,
      title: step.props.title,
      schema: step.props.schema,
      children: step.props.children,
      fields: Object.keys(schema.shape || {}),
    };
  });

  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = stepConfigs.length;
  const isLastStep = currentStep === totalSteps - 1;
  const currentFields = stepConfigs[currentStep]?.fields || [];

  // Combine all step schemas into a full schema if rootSchema not provided
  const finalSchema =
    rootSchema ?? mergePartialSchemas(stepConfigs.map((s) => s.schema));

  const internalForm = useForm<TFullData>({
    resolver: zodResolver(finalSchema as any) as Resolver<TFullData>,
    defaultValues: initialData as DefaultValues<TFullData>,
    mode: "onChange",
  });

  const methods = externalForm ?? internalForm;

  const { trigger, formState } = methods;

  const nextStep = useCallback(async () => {
    const isValid = await trigger(currentFields as FieldPath<TFullData>[]);
    if (!isValid) return;

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await methods.handleSubmit(onSubmit)();
    }

    if (isValid && currentStep === totalSteps - 1) {
      await methods.handleSubmit((data) => onSubmit(data))();
    }
  }, [trigger, currentFields, currentStep, totalSteps, onSubmit, methods]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) setCurrentStep(index);
    },
    [totalSteps],
  );

  const currentStepErrors = Object.keys(formState.errors).reduce(
    (acc, key) => {
      if (currentFields.includes(key)) {
        const error = formState.errors[key];
        acc[key] = error?.message ? String(error.message) : undefined;
      }
      return acc;
    },
    {} as Record<string, string | undefined>,
  );

  const contextValue: MultiStepContextValue<TFullData> = {
    currentStepIndex: currentStep,
    totalSteps,
    register: methods.register,
    setValue: methods.setValue,
    getValues: methods.getValues,
    trigger: methods.trigger,
    formState: methods.formState,
    control: methods.control,
    currentStepErrors,
    nextStep,
    prevStep,
    goToStep,
    steps: stepConfigs.map((s) => ({ id: s.id, title: s.title })),
    form: methods,
  };

  return (
    <MultiStepContext.Provider value={contextValue}>
      <div className={`multi-step-root ${className}`}>
        <div className="flex items-center justify-center flex-wrap md:lg:xl:flex-nowrap gap-5 py-3 my-1">
          {stepConfigs.map((config, idx) => (
            <Fragment key={config.id}>
              <div
                className={`w-full px-5 py-2 uppercase font-medium text-center text-xs rounded-full ${idx === currentStep ? "bg-black text-white" : "bg-white text-neutral-800"}`}
              >
                <span className="whitespace-nowrap shrink-0 ">
                  {idx + 1}. {config.title}
                </span>
              </div>
              {idx !== stepConfigs.length - 1 && (
                <div
                  className={`h-2 hidden md:lg:xl:flex rounded-md w-full ${currentStep === idx + 1 || currentStep > 1 ? "bg-black/20" : "bg-white"}`}
                />
              )}
            </Fragment>
          ))}
        </div>
        <div className="multi-step-content my-3">
          {stepConfigs[currentStep]?.children}
        </div>
        {showNavigation && (
          <div
            className="multi-step-navigation flex items-center justify-center"
            style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
          >
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0 || formState.isSubmitting}
              className="bg-black text-white rounded-full p-2 text-sm"
            >
              <AltArrowLeft size={16} weight="Outline" />
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={formState.isSubmitting}
              className="bg-black text-white rounded-full p-2 text-sm"
            >
              {formState.isSubmitting ? (
                <Spinner size={16} color="#FFFFFF" />
              ) : isLastStep ? (
                <CheckCircle size={18} weight="Bold" />
              ) : (
                <AltArrowRight size={16} weight="Outline" />
              )}
            </button>
          </div>
        )}
      </div>
    </MultiStepContext.Provider>
  );
}

// ============================================
// Step Component (marker – doesn't render)
// ============================================
export function Step<TFullData extends FieldValues>(
  _props: StepProps<TFullData>,
) {
  return null;
}

// ============================================
// Optional: StepIndicator
// ============================================
export function StepIndicator() {
  const { steps, currentStepIndex, goToStep } = useMultiStepForm();
  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
      {steps.map((step, idx) => (
        <button
          type="button"
          key={step.id}
          onClick={() => goToStep(idx)}
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            background:
              idx === currentStepIndex
                ? "blue"
                : idx < currentStepIndex
                  ? "green"
                  : "#ccc",
            color: "white",
            border: "none",
          }}
        >
          {idx < currentStepIndex ? "✓" : idx + 1}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Export compound component
// ============================================
export const MultiStep = {
  Root,
  Step,
  StepIndicator,
  useMultiStepForm,
};

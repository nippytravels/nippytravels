"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AltArrowLeft,
  AltArrowRight,
  CheckCircle,
} from "@solar-icons/react/ssr";
import { motion } from "motion/react";
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
  nextButtonText = "Next",
  prevButtonText = "Back",
  submitButtonText = "Submit request",
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
      return;
    }

    // Last step: submit once. If an earlier step has an error (for example a cross-step rule),
    // jump back to the first step that has one instead of failing silently.
    await methods.handleSubmit(onSubmit, (errors) => {
      const index = stepConfigs.findIndex((s) =>
        s.fields.some((field) => field in errors),
      );
      if (index >= 0) setCurrentStep(index);
    })();
  }, [
    trigger,
    currentFields,
    currentStep,
    totalSteps,
    onSubmit,
    methods,
    stepConfigs,
  ]);

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
        {/* Progress: compact on mobile, pills with connectors from md up */}
        <div className="mb-8">
          <div className="md:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone">
              Step {currentStep + 1} of {totalSteps}
            </p>
            <p className="mt-1 font-display text-xl text-ink">
              {stepConfigs[currentStep]?.title}
            </p>
            <div
              role="progressbar"
              aria-label="Form progress"
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-valuenow={currentStep + 1}
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-300"
            >
              <motion.div
                initial={false}
                animate={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                }}
                className="h-full rounded-full bg-clay"
              />
            </div>
          </div>

          <ol className="hidden items-center gap-3 md:flex">
            {stepConfigs.map((config, idx) => (
              <Fragment key={config.id}>
                <li
                  aria-current={idx === currentStep ? "step" : undefined}
                  className={`flex-none whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold ${
                    idx === currentStep
                      ? "bg-ink text-sand"
                      : idx < currentStep
                        ? "bg-sage-100 text-sage-800"
                        : "bg-sand-100 text-stone"
                  }`}
                >
                  {idx + 1}. {config.title}
                </li>
                {idx !== stepConfigs.length - 1 && (
                  <li
                    aria-hidden="true"
                    className="h-0.5 min-w-4 flex-1 overflow-hidden rounded-full bg-sand-300"
                  >
                    <motion.div
                      initial={false}
                      animate={{ width: currentStep > idx ? "100%" : "0%" }}
                      className="h-full bg-sage"
                    />
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
        </div>

        <div className="multi-step-content">
          {stepConfigs[currentStep]?.children}
        </div>

        {showNavigation && (
          <div className="multi-step-navigation mt-8 flex items-center justify-between gap-3 border-t border-sand-300 pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0 || formState.isSubmitting}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-sand-400 bg-white px-5 text-[15px] font-semibold text-ink transition hover:bg-sand-100 disabled:invisible"
            >
              <AltArrowLeft size={16} weight="Outline" />
              {prevButtonText}
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={formState.isSubmitting}
              className="inline-flex min-h-12 min-w-32 items-center justify-center gap-2 rounded-full border border-clay bg-clay px-6 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {formState.isSubmitting ? (
                <Spinner size={14} color="#FFFFFF" />
              ) : isLastStep ? (
                <>
                  {submitButtonText}
                  <CheckCircle size={18} weight="Bold" />
                </>
              ) : (
                <>
                  {nextButtonText}
                  <AltArrowRight size={16} weight="Outline" />
                </>
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
    <div className="mb-4 flex gap-2">
      {steps.map((step, idx) => (
        <button
          type="button"
          key={step.id}
          onClick={() => goToStep(idx)}
          aria-label={`Go to ${step.title}`}
          aria-current={idx === currentStepIndex ? "step" : undefined}
          className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold ${
            idx === currentStepIndex
              ? "bg-clay text-white"
              : idx < currentStepIndex
                ? "bg-ink text-sand"
                : "bg-sand-100 text-stone"
          }`}
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

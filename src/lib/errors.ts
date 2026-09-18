import { toast } from "sonner";

type SafeActionResult = {
  data?: any;
  serverError?: any;
  validationErrors?: any;
};

function extractValidationMessages(
  errors: unknown,
  path: string[] = [],
): string[] {
  if (!errors || typeof errors !== "object") {
    return [];
  }

  const messages: string[] = [];

  for (const [key, value] of Object.entries(errors)) {
    // next-safe-action / Zod formatted errors use `_errors`
    if (key === "_errors" && Array.isArray(value)) {
      for (const message of value) {
        if (typeof message === "string" && message.trim()) {
          messages.push(message);
        }
      }

      continue;
    }

    if (value && typeof value === "object") {
      messages.push(...extractValidationMessages(value, [...path, key]));
    }
  }

  return messages;
}

export function handleActionError(result: SafeActionResult | null | undefined) {
  if (!result) {
    toast.error("Something went wrong. Please try again.");
    return;
  }

  // Validation errors
  if (result.validationErrors) {
    const messages = extractValidationMessages(result.validationErrors);

    if (messages.length === 0) {
      toast.error("Please check your input and try again.");
      return;
    }

    // Show the first error as the main toast.
    // Avoid flooding the user with 10+ toasts.
    toast.error(messages[0], {
      description:
        messages.length > 1
          ? `${messages.length - 1} more issue${
              messages.length === 2 ? "" : "s"
            } found.`
          : undefined,
    });

    return;
  }

  // Server error
  if (result.serverError) {
    const message =
      typeof result.serverError === "string"
        ? result.serverError
        : "Something went wrong. Please try again.";

    toast.error(message);
    return;
  }

  // No error
  return;
}

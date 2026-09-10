import { createSafeActionClient } from "next-safe-action";

/**
 *
 * Default action client. Does not have any internal protection.
 * Will most likely be only used for authentication actions that do
 * not require prior authentication
 *
 */
export const client = createSafeActionClient({
  handleServerError: (e) => {
    console.error(e);
    console.error(`[Server Error] => ${e.message}`);
    return e.message;
  },
  defaultValidationErrorsShape: "flattened",
});

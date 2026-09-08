import { client } from "./action-client";
import { FormSchema } from "./validations";

export const submitFormAction = client
  .inputSchema(FormSchema)
  .action(async ({ parsedInput }) => {
    console.log({ parsedInput });

    return true;
  });

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { FormInput, Spinner } from "@/components/atoms";
import { login } from "@/lib/actions";
import { handleActionError } from "@/lib/errors";
import { LoginSchema } from "@/lib/validations";

export default function Page() {
  const { form, action, handleSubmitWithAction } = useHookFormAction(
    login,
    zodResolver(LoginSchema),
    {
      actionProps: {
        onError: ({ error }) => handleActionError(error),
      },
      formProps: {
        mode: "onChange",
      },
    },
  );

  return (
    <div className="flex w-full h-screen items-center justify-center bg-neutral-200">
      <form
        className="bg-white w-2/6 h-3/6 rounded-lg border border-solid shadow-lg border-neutral-300 p-5 flex flex-col items-center justify-center gap-5"
        onSubmit={handleSubmitWithAction}
      >
        <h1 className="my-3 font-extrabold text-xl text-center text-blue-400">
          Login To Meridian Viewer for Nippy Travels
        </h1>
        <FormInput
          control={form.control}
          name="email"
          placeholder="Email"
          label="Email"
        />
        <FormInput
          control={form.control}
          name="password"
          placeholder="Password"
          label="Password"
          type="password"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 disabled:bg-neutral-500 bg-blue-500 text-white p-2 rounded-sm w-full font-medium uppercase text-sm"
        >
          <span>Login</span>
          {action.isExecuting && <Spinner size={14} color="#FFFFFF" />}
        </button>
      </form>
    </div>
  );
}

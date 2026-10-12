"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import Link from "next/link";
import { FormInput } from "@/components/atoms";
import { login } from "@/lib/actions";
import { LoginSchema } from "@/lib/validations";

export default function LoginPage() {
  const { form, action, handleSubmitWithAction } = useHookFormAction(
    login,
    zodResolver(LoginSchema),
    {
      formProps: {
        defaultValues: {
          email: "",
          password: "",
        },
      },
    },
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Brand panel */}
      <section className="flex flex-col justify-between gap-10 bg-ink px-6 py-8 text-sand md:w-[52%] md:px-16 md:py-12">
        <Link href="/" className="font-display text-2xl">
          Nippy Travels
        </Link>
        <div>
          <h1 className="font-display text-[32px] leading-[1.06] tracking-[-0.025em] md:max-w-[520px] md:text-[56px]">
            Every request, in one <em className="not-italic text-sage">calm</em>{" "}
            place.
          </h1>
          <p className="mt-6 hidden max-w-[440px] text-lg leading-relaxed text-sage-mist md:block">
            Review traveler details, follow up on missing information and turn
            requests into bookings.
          </p>
        </div>
        <svg
          viewBox="0 0 600 110"
          fill="none"
          aria-hidden="true"
          className="hidden h-auto w-full max-w-[560px] md:block"
        >
          <path
            d="M10 100 C 160 -20, 440 -20, 590 100"
            stroke="var(--color-sage)"
            strokeWidth="2"
            strokeDasharray="3 8"
            strokeLinecap="round"
          />
          <circle cx="10" cy="100" r="6" fill="var(--color-clay)" />
          <circle
            cx="590"
            cy="100"
            r="6"
            stroke="var(--color-sage)"
            strokeWidth="2"
          />
        </svg>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 flex-col px-6 pb-10 pt-10 md:px-16 md:py-12">
        <div className="flex justify-end">
          <Link
            href="/"
            className="text-sm font-semibold text-ink underline decoration-sand-400 underline-offset-4 hover:decoration-clay"
          >
            ← Back to website
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h2 className="mb-2 font-display text-[40px] tracking-[-0.02em] text-ink">
              Sign in
            </h2>
            <p className="mb-9 text-base leading-relaxed text-stone">
              This area is for Nippy Travels staff.
            </p>

            <form
              onSubmit={handleSubmitWithAction}
              noValidate
              className="flex flex-col gap-5"
            >
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="you@example.com"
              />
              <div>
                <FormInput
                  control={form.control}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                />
                {/* <div className="mt-2 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-ink underline decoration-sand-400 underline-offset-4 hover:decoration-clay"
                  >
                    Forgot password?
                  </Link>
                </div> */}
              </div>
              {action.result.serverError && (
                <p role="alert" className="text-sm font-medium text-clay-800">
                  {action.result.serverError}
                </p>
              )}
              <button
                type="submit"
                disabled={action.isPending}
                className="mt-2 flex min-h-[40px] text-sm w-full items-center justify-center rounded-full border border-clay bg-clay text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {action.isPending ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-[13px] text-stone">
          © {new Date().getFullYear()} Nippy Travels
        </p>
      </section>
    </div>
  );
}

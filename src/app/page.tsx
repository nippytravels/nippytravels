/** biome-ignore-all lint/a11y/useAnchorContent: no time*/
"use client";

import { Menu } from "@base-ui/react/menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import Link from "next/link";
import { FormInput } from "@/components/atoms";
import { bookAppointment } from "@/lib/actions";
import { appointmentDefaults, appointmentSchema } from "@/lib/validations";

type Service = { title: string; body: string };
type Point = { title: string; body: string };

const services: Service[] = [
  {
    title: "Visa assistance",
    body: "Guidance on entry requirements, documents and applications for your destination, so nothing is missing at submission.",
  },
  {
    title: "Flight booking",
    body: "Domestic or international flights that fit your schedule and budget. We compare routes, airlines, fares and baggage options before you travel.",
  },
  {
    title: "Airport transfers",
    body: "Reliable transport between the airport, your hotel and key destinations, with no unfamiliar routes or last-minute scrambling.",
  },
  {
    title: "Travel consultation",
    body: "Personalised advice on destinations, trip timing, budgets, travel requirements and itineraries.",
  },
];

const approach: Point[] = [
  {
    title: "One point of contact",
    body: "Deal with one team for every part of your trip, instead of chasing several providers.",
  },
  {
    title: "Clear options",
    body: "We lay out your choices and costs plainly, so you decide with full information.",
  },
  {
    title: "Planned end to end",
    body: "From paperwork to the ride waiting at arrivals, each step is arranged ahead of time.",
  },
];

const btn =
  "inline-flex min-h-[52px] w-full items-center justify-center rounded-full px-6 text-base font-semibold transition md:w-auto md:px-[26px] md:text-[15px]";
const btnPrimary = `${btn} border border-clay bg-clay text-white hover:brightness-110`;
const btnOutline = `${btn} border border-sand-400 text-ink hover:bg-sand-100 bg-white`;
const btnOnDark = `${btn} border border-ink-500 text-sand hover:bg-ink-800`;

const eyebrow =
  "mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-stone md:mb-5 md:text-[13px]";
const h2 =
  "font-display text-[34px] leading-[1.1] tracking-[-0.015em] md:text-[44px]";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-[1080px] px-8 pb-8 pt-18 md:pb-10 md:pt-28 md:text-center">
          <p className={eyebrow}>Your express travel management agency</p>
          <h1 className="font-display text-[46px] leading-[1.05] tracking-[-0.025em] md:mx-auto md:max-w-[860px] md:text-[76px] md:leading-[1.02]">
            Travel, made <em className="not-italic text-clay">effortless.</em>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stone md:mx-auto md:mt-7 md:max-w-[540px] md:text-[19px]">
            Visas, flights, airport transfers and trip planning, handled by one
            team from your first question to your arrival.
          </p>
          <div className="mt-8 flex flex-col gap-3 md:mt-10 md:flex-row md:justify-center">
            <a href="#contact" className={btnPrimary}>
              Book an appointment
            </a>
            <Link href="/request" className={btnOutline}>
              Request a quote
            </Link>
          </div>

          {/* Flight path: flatter on mobile, wider on desktop */}
          <svg
            viewBox="0 0 342 80"
            fill="none"
            aria-hidden="true"
            className="mt-12 h-auto w-full md:hidden"
          >
            <path
              d="M8 70 C 100 -10, 240 -10, 334 70"
              stroke="var(--color-sage)"
              strokeWidth="2"
              strokeDasharray="3 8"
              strokeLinecap="round"
            />
            <circle cx="8" cy="70" r="6" fill="var(--color-clay)" />
            <circle
              cx="334"
              cy="70"
              r="6"
              stroke="var(--color-sage)"
              strokeWidth="2"
            />
          </svg>
          <svg
            viewBox="0 0 900 120"
            fill="none"
            aria-hidden="true"
            className="mx-auto mt-[72px] hidden h-auto w-full max-w-[900px] md:block"
          >
            <path
              d="M30 100 C 280 -30, 620 -30, 870 100"
              stroke="var(--color-sage)"
              strokeWidth="2"
              strokeDasharray="3 8"
              strokeLinecap="round"
            />
            <circle cx="30" cy="100" r="6" fill="var(--color-clay)" />
            <circle
              cx="870"
              cy="100"
              r="6"
              stroke="var(--color-sage)"
              strokeWidth="2"
            />
          </svg>
        </section>
        <section
          id="services"
          className="mx-auto max-w-[1080px] px-8 pb-6 pt-22 md:pb-10 md:pt-24"
        >
          <p className={eyebrow}>Services</p>
          <h2 className={`${h2} mb-11 max-w-[560px] md:mb-14`}>
            Everything your trip needs, in one place.
          </h2>
          <ol>
            {services.map((s, i) => (
              <li
                key={s.title}
                className="grid grid-cols-[40px_1fr] gap-x-2 gap-y-2.5 border-t border-sand-300 py-9 last:border-b md:grid-cols-[72px_1fr_1.3fr] md:items-baseline md:gap-x-8"
              >
                <span className="pt-1 font-display text-lg text-clay md:pt-0 md:text-[22px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-[26px] md:text-[30px]">
                  {s.title}
                </h3>
                <p className="col-start-2 text-base leading-[1.7] text-stone md:col-start-3">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section
          id="approach"
          className="mx-auto max-w-[1080px] px-8 pb-24 pt-22 md:pb-28 md:pt-24"
        >
          <p className={eyebrow}>Our approach</p>
          <h2 className={`${h2} mb-11 max-w-[560px] md:mb-14`}>
            A calmer way to travel.
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            {approach.map((p) => (
              <div
                key={p.title}
                className="border-t-2 border-sage pt-5 md:pt-6"
              >
                <h3 className="mb-2.5 font-display text-2xl md:mb-3 md:text-[26px]">
                  {p.title}
                </h3>
                <p className="text-base leading-[1.7] text-stone">{p.body}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="contact" className="bg-ink">
          <div className="mx-auto max-w-[1080px] px-8 py-24 md:grid md:grid-cols-[1fr_1.1fr] md:items-start md:gap-20 md:py-28">
            <div>
              <p className={`${eyebrow} text-sage`}>Get started</p>
              <h2 className="mb-4 font-display text-[38px] leading-[1.08] tracking-[-0.02em] text-sand md:mb-5 md:text-[46px]">
                Tell us where you&apos;d like to go.
              </h2>
              <p className="mb-7 text-[17px] leading-[1.7] text-sage-mist md:mb-8 md:max-w-[400px]">
                Send a quick request, or book a time to talk it through with us.
              </p>
              <a href="#contact" className={btnOnDark}>
                Book an appointment
              </a>
            </div>
            <QuoteForm />
          </div>
        </section>
      </main>
      <footer className="border-t border-sand-300">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-2.5 px-8 py-14 text-sm text-stone md:min-h-24 md:flex-row md:items-center md:justify-between md:py-0">
          <span className="font-display text-xl text-ink">Nippy Travels</span>
          <span className="uppercase">
            nippytravels@gmail.com · (+234) 805 5465 909
          </span>
          <span>© {new Date().getFullYear()} Nippy Travels</span>
        </div>
      </footer>
    </>
  );
}

type NavLink = { href: string; label: string };

const links: NavLink[] = [
  { href: "#services", label: "Services" },
  { href: "#approach", label: "Approach" },
  { href: "#contact", label: "Contact" },
  {
    href: "/request",
    label: "My Form",
  },
];

const menuItem =
  "flex min-h-12 cursor-pointer select-none items-center rounded-xl px-4 text-base font-medium text-ink outline-none data-[highlighted]:bg-sand-100";

function SiteHeader() {
  return (
    <header>
      <div className="mx-auto flex h-20 max-w-[1080px] items-center justify-between px-8 md:h-22">
        <Link
          href="/"
          className="font-display text-[22px] font-bold tracking-tight text-ink md:text-2xl"
        >
          Nippy Travels
        </Link>
        <nav aria-label="Main" className="hidden gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium text-stone transition hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="hidden bg-white custom-inset md:lg:xl:inline-flex min-h-11 items-center justify-center rounded-full border border-sand-400 px-5 text-[15px] font-semibold text-ink transition hover:bg-sand-100"
        >
          Book an appointment
        </a>
        <div className="bg-blue-500 inline-flex md:lg:xl:hidden">
          <Menu.Root>
            <Menu.Trigger aria-label="Menu">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="text-ink"
              >
                <path
                  d="M4 8h16M4 16h16"
                  className="group-data-[popup-open]:hidden"
                />
                <path
                  d="M6 6l12 12M18 6L6 18"
                  className="hidden group-data-[popup-open]:block"
                />
              </svg>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner
                align="end"
                sideOffset={8}
                className="z-20 outline-none"
              >
                <Menu.Popup className="w-[min(20rem,calc(100vw-4rem))] origin-[var(--transform-origin)] rounded-2xl border border-sand-300 bg-sand p-2 shadow-[0_20px_50px_rgba(26,46,32,0.12)] outline-none transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                  {links.map((l) => (
                    <Menu.Item
                      key={l.href}
                      render={<a href={l.href} />}
                      className={menuItem}
                    >
                      {l.label}
                    </Menu.Item>
                  ))}
                  <Menu.Separator className="mx-2 my-2 h-px bg-sand-300" />
                  <Menu.Item
                    render={<a href="#contact" />}
                    className="flex min-h-[52px] cursor-pointer select-none items-center justify-center rounded-full border border-clay bg-clay text-base font-semibold text-white outline-none data-[highlighted]:brightness-110"
                  >
                    Book an appointment
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>
    </header>
  );
}

function QuoteForm() {
  const { form, action, handleSubmitWithAction } = useHookFormAction(
    bookAppointment,
    zodResolver(appointmentSchema),
    { formProps: { defaultValues: appointmentDefaults } },
  );

  if (action.hasSucceeded) {
    const email = action.result.data?.email ?? "";
    return (
      <div className="mt-10 rounded-[20px] bg-white p-7 md:mt-0 md:p-10">
        <h3 className="font-display text-[28px] leading-[1.1] tracking-[-0.01em] text-ink">
          Thank you
        </h3>
        <p className="mt-3 text-base leading-[1.7] text-stone">
          We have your request and will be in touch at {email}.
        </p>
        <p className="mt-6 text-base leading-[1.7] text-stone">
          Want to save time? Send us your details now.
        </p>
        <Link
          href={`/request?email=${encodeURIComponent(email)}`}
          className={`${btnPrimary} mt-4 md:w-full`}
        >
          Fill in my details
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmitWithAction}
      noValidate
      className="mt-10 flex flex-col gap-5 rounded-[20px] bg-white p-7 md:mt-0 md:p-10"
    >
      <FormInput
        control={form.control}
        name="destination"
        label="Destination"
        placeholder="Where to?"
      />
      <FormInput
        control={form.control}
        name="date"
        label="Travel date"
        type="date"
        placeholder="Pick a date"
      />
      <FormInput
        control={form.control}
        name="email"
        label="Email"
        placeholder="you@example.com"
      />
      {action.result.serverError && (
        <p role="alert" className="text-sm font-medium text-clay-800">
          {action.result.serverError}
        </p>
      )}
      <button
        type="submit"
        disabled={action.isPending}
        className={`${btnPrimary} mt-2 disabled:opacity-60 md:w-full`}
      >
        {action.isPending ? "Sending…" : "Request a quote"}
      </button>
    </form>
  );
}

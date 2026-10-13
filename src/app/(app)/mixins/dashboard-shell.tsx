"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

const COOKIE = "dashboard-sidebar";

type NavItem = { label: string; href: string; d: string };

const navItems: NavItem[] = [
  {
    label: "Requests",
    href: "/admin",
    d: "M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5",
  },
  {
    label: "Appointments",
    href: "/admin/appointments",
    d: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4",
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    d: "M3 8h18v11H3zM9 8V5h6v3",
  },
  {
    label: "Form settings",
    href: "/admin/settings",
    d: "M4 7h10M18 7h2M4 17h2M10 17h10",
  },
];

const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export default function DashboardShell({
  defaultOpen,
  children,
}: {
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: session } = useSession();

  const setSidebar = useCallback((next: boolean) => {
    if (isDesktop()) {
      setOpen(next);
      // biome-ignore lint/suspicious/noDocumentCookie: faster
      document.cookie = `${COOKIE}=${next ? "open" : "closed"}; path=/; max-age=31536000; samesite=lax`;
    } else {
      setMobileOpen(next);
    }
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen flex-col bg-sand text-ink lg:h-screen lg:flex-row lg:overflow-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
        />
      )}
      <aside
        id="dashboard-sidebar"
        aria-label="Dashboard"
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-none flex-col bg-ink px-4 py-7 text-sand transition-[transform,visibility] duration-200 lg:visible lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        } ${open ? "lg:flex" : "lg:hidden"}`}
      >
        <div className="flex items-center justify-between pb-7 pl-3">
          <Link href="/" className="font-display text-[22px]">
            Nippy Travels
          </Link>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebar(false)}
            className="flex size-11 items-center justify-center rounded-[10px] text-sage-mist hover:bg-ink-800"
          >
            <Icon d="M6 6l12 12M18 6L6 18" />
          </button>
        </div>
        <nav aria-label="Dashboard pages" className="flex flex-col gap-1">
          {navItems.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-medium ${
                isActive(n.href)
                  ? "bg-ink-700 text-sand"
                  : "text-sage-mist hover:bg-ink-800"
              }`}
            >
              <Icon d={n.d} />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-ink-700 px-3 pt-4 text-sm text-sage-mist">
          ${session?.user.name}
          <br />
          <span className="text-[13px]">{session?.user.email}</span>
        </div>
      </aside>
      {/* Backdrop for the mobile drawer */}{" "}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Shown on mobile, and on desktop whenever the sidebar is collapsed */}
        <div
          className={`flex h-14 flex-none items-center gap-2 border-b border-sand-300 px-3 ${open ? "lg:hidden" : ""}`}
        >
          <button
            type="button"
            aria-label="Open sidebar"
            aria-controls="dashboard-sidebar"
            onClick={() => setSidebar(true)}
            className="flex size-11 items-center justify-center rounded-[10px] hover:bg-sand-100"
          >
            <Icon d="M4 8h16M4 16h16" />
          </button>
          <Link href="/" className="font-display text-xl">
            Nippy Travels
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

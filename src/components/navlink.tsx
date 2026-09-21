"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-md corner-squircle p-1.25 text-sm flex items-center justify-center ${
        isActive
          ? "text-blue-950 font-bold bg-white"
          : "bg-neutral-200 text-neutral-800"
      }`}
    >
      {children}
    </Link>
  );
}

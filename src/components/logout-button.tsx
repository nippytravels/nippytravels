"use client";

import { useAction } from "next-safe-action/hooks";
import { logout } from "@/lib/actions";
import { Spinner } from "./atoms";

type Props = {
  children?: React.ReactNode;
};

export default function LogoutButton({ children }: Props) {
  const { execute, isPending } = useAction(logout);
  return (
    <button
      className="menu-item data-highlighted:text-red-500 data-highlighted:before:bg-red-100"
      type="button"
      onClick={() => execute()}
    >
      {isPending ? <Spinner size={20} /> : children}
    </button>
  );
}

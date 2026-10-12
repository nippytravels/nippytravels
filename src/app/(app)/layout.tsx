import { Dialog } from "@base-ui/react";
import { Menu } from "@base-ui/react/menu";
import { Document, Exit, Magnifier } from "@solar-icons/react/ssr";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NavLink } from "@/components";
import { Avatar, Tooltip } from "@/components/atoms";
import LogoutButton from "@/components/logout-button";
import { SearchInput } from "@/components/search-input";
import { searchForms } from "@/lib/actions";
import { auth } from "@/lib/auth";
import * as S from "@/lib/db/schema";

const ROOT_DOMAIN = "nippytravels.com";
const ADMIN_SUBDOMAIN = "admin";
const isDev = process.env.NODE_ENV === "development";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const hostname = host.split(":")[0];

  if (getSubdomain(hostname) !== ADMIN_SUBDOMAIN && !isDev) {
    redirect(`https://${ROOT_DOMAIN}`);
  }

  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect(
      isDev
        ? "http://localhost:3000/login"
        : `https://${ADMIN_SUBDOMAIN}.${ROOT_DOMAIN}/login`,
    );
  }

  if (session?.user.role !== "admin" && !isDev) {
    redirect(`https://${ROOT_DOMAIN}`); // logged in, but not an admin
  }

  return (
    <main className="w-full noise-medium h-screen flex flex-col-reverse md:lg:xl:flex-row">
      {children}
    </main>
  );
}

function getSubdomain(hostname: string): string | null {
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`)
    return null;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`))
    return hostname.replace(`.${ROOT_DOMAIN}`, "");
  return null;
}

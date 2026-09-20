import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
    <main id="workspace" className="p-2 w-full h-screen">
      <div className="w-full h-full rounded-lg corner-squircle border border-solid border-neutral-200 bg-white">
        {children}
      </div>
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

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const ROOT_DOMAIN = "website.com";
const ADMIN_SUBDOMAIN = "admin";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const hostname = host.split(":")[0];

  if (getSubdomain(hostname) !== ADMIN_SUBDOMAIN) {
    redirect(`https://${ROOT_DOMAIN}`);
  }

  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect(`https://${ADMIN_SUBDOMAIN}.${ROOT_DOMAIN}/login`);
  }

  if (session.user.role !== "admin") {
    redirect(`https://${ROOT_DOMAIN}`); // logged in, but not an admin
  }

  return <>{children}</>;
}

function getSubdomain(hostname: string): string | null {
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`)
    return null;
  if (hostname.endsWith(`.${ROOT_DOMAIN}`))
    return hostname.replace(`.${ROOT_DOMAIN}`, "");
  return null;
}

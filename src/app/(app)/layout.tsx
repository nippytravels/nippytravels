import { Menu } from "@base-ui/react/menu";
import { Document, Exit } from "@solar-icons/react/ssr";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NavLink } from "@/components";
import { Avatar, Tooltip } from "@/components/atoms";
import LogoutButton from "@/components/logout-button";
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
    <main className="w-full font-dash noise-medium h-screen flex flex-col-reverse md:lg:xl:flex-row">
      <div className="w-full h-[3%] md:lg:xl:w-[3%] md:lg:xl:h-full flex flex-col items-center justify-between py-2">
        <div className="flex flex-col items-center justify-center pt-2 h-full gap-3 w-full">
          <Tooltip content="View Forms">
            <NavLink href="/admin/forms">
              <Document size={20} weight="Bold" />
            </NavLink>
          </Tooltip>
        </div>
        <Menu.Root>
          <Menu.Trigger>
            <Avatar
              alt="user_icon"
              fallback={`${session.user.name.slice(0, 1)}${session.user.name.slice(1, 2)}`}
              imageUrl={session.user.image ?? ""}
            />
          </Menu.Trigger>
          <Menu.Portal className="">
            <Menu.Positioner className="outline-hidden" sideOffset={8}>
              <Menu.Arrow className="relative block h-1.5 w-3 overflow-clip data-[side=bottom]:-top-1.5 data-[side=left]:-right-2.25 data-[side=left]:rotate-90 data-[side=right]:-left-2.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-1.5 data-[side=top]:rotate-180 before:absolute before:bottom-0 before:left-1/2 before:h-[calc(6px*sqrt(2))] before:w-[calc(6px*sqrt(2))] before:transform-[translate(-50%,50%)_rotate(45deg)] before:border before:border-neutral-100 before:bg-white before:content-['']" />
              <Menu.Popup className="relative origin-(--transform-origin) border border-neutral-100 rounded-md bg-white py-1 text-neutral-950 shadow outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
                <Menu.Item render={<LogoutButton />} className="menu-item">
                  <Exit size={14} weight="Bold" />
                  <span>Logout</span>
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
      <div className="w-full h-[97%] md:lg:xl:h-full md:lg:xl:w-[97%] bg-white md:lg:xl:rounded-l-xl md:lg:xl:border-l md:lg:xl:border-l-solid md:lg:xl:border-l-neutral-200">
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

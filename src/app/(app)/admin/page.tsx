import { Menu } from "@base-ui/react/menu";
import { Tabs } from "@base-ui/react/tabs";
import { Exit } from "@solar-icons/react/ssr";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/atoms";
import LogoutButton from "@/components/logout-button";
import { auth } from "@/lib/auth";
import FormsView from "./mixins/forms-view";

const tabTitle =
  "text-xs font-medium uppercase rounded-md corner-squircle px-5 py-2 flex items-center justify-center gap-3 data-active:text-blue-600 data-active:bg-blue-50 text-neutral-700";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const { user } = session;

  return (
    <Tabs.Root className="w-full h-full overflow-hidden overflow-y-scroll">
      <Tabs.List className="w-full flex px-2 py-1 items-center justify-between border-b border-b-solid border-b-neutral-200">
        <div className="flex items-center justify-end">
          <Tabs.Tab className={tabTitle} value="forms">
            Forms
          </Tabs.Tab>
        </div>
        <div className="flex items-center justify-end w-full">
          <Menu.Root>
            <Menu.Trigger>
              <Avatar
                imageUrl={user.image ?? ""}
                fallback={`${user.name.slice()[0]}${user.name.slice()[1]}`}
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
      </Tabs.List>
      <Tabs.Panel value="forms" className="w-full h-[90vh]">
        <FormsView searchParams={searchParams} />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

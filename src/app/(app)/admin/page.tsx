import { Tabs } from "@base-ui/react/tabs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/atoms";
import { auth } from "@/lib/auth";

const tabTitle =
  "text-sm font-medium uppercase border-x border-x-solid border-x-neutral-200 px-5 py-2.5 data-active:bg-blue-50 flex items-center justify-center gap-3 data-active:text-blue-600 data-active:custom-inset text-neutral-700";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log({ session });

  if (!session) {
    return redirect("/login");
  }

  const { user } = session;

  return (
    <div className="w-full h-screen bg-neutral-200 p-1">
      <Tabs.Root className="w-full h-full rounded-md border border-solid border-neutral-300 bg-white">
        <Tabs.List className="w-full flex items-center justify-between border-b border-b-solid border-b-neutral-200">
          <div className="flex items-center justify-end">
            <Tabs.Tab className={tabTitle} value="forms">
              Forms
            </Tabs.Tab>
            <Tabs.Tab className={tabTitle} value="appointments">
              Appointments
            </Tabs.Tab>
          </div>
          <div className="flex items-center justify-end w-full">
            <Avatar
              imageUrl={user.image ?? ""}
              fallback={`${user.name.slice()[0]}${user.name.slice()[1]}`}
            />
          </div>
        </Tabs.List>
      </Tabs.Root>
    </div>
  );
}

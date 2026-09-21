import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import { Tooltip } from "@/components/atoms";
import { db } from "@/lib/db";

const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

export default async function Page() {
  const recent = await db.query.form
    .findMany({
      where: (fields, { gte }) => gte(fields.createdAt, twentyFourHoursAgo),
      columns: {
        id: true,
      },
    })
    .then((res) => res.length);

  return (
    <main className="w-full h-full flex flex-col items-center justify-center">
      <Image src={logo} alt="logo" className="size-20 my-3" />
      <h1 className="font-title text-3xl">Welcome Back Nippy Travels</h1>
      <span className="uppercase text-neutral-400 font-display">
        Management console
      </span>
      <div className="flex items-center justify-center gap-3 my-4">
        <button
          className="text-xs transition font-medium hover:shadow uppercase bg-neutral-100 px-5 py-2 rounded-md"
          type="button"
        >
          View Appointments
        </button>
        <Link
          href="/admin/forms"
          className="uppercase font-medium bg-black text-xs text-white px-5 py-2 rounded-lg shadow-lg corner-squircle flex items-center justify-center gap-3"
        >
          View Filled Forms
          <Tooltip content="New Forms">
            <span className="bg-white text-black font-medium px-1.5 py-0.5 rounded-full">
              {recent}
            </span>
          </Tooltip>
        </Link>
      </div>
    </main>
  );
}

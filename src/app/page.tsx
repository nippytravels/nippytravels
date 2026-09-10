import { Document } from "@solar-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import { Squiggle } from "@/components";

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col relative items-center justify-center p-6 md:lg:xl:0">
      <Squiggle className="absolute hidden md:lg:xl:flex z-0 -left-30 text-blue-500/80" />
      <Squiggle className="absolute hidden md:lg:xl:flex z-0 -left-30 text-blue-500/10" />
      <Squiggle className="absolute hidden md:lg:xl:flex z-0 -left-30 text-blue-500/5" />
      <Image src={logo} width={90} height={90} alt="logo" className="my-2" />
      <div className="absolute z-2 top-0 right-0 bg-neutral-50 w-full md:lg:xl:w-2/6 py-4 px-5 flex items-center justify-end gap-4 uppercase font-medium text-[13px]">
        <Link
          className="hover:underline underline-offset-1 text-neutral-600 hover:text-black transition"
          href="/"
        >
          Book an appointment
        </Link>
        <Link
          className="hover:underline underline-offset-1 text-neutral-600 hover:text-black transition"
          href={`/?viewing=form`}
        >
          Fill my form
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center my-6">
        <h1 className="text-4xl md:lg:xl:text-5xl font-extrabold uppercase">
          Nippy Travels
        </h1>
        <span className="text-center text-lg md:lg:xl:text-xl font-bold text-neutral-800">
          Discover More, Travel Better
        </span>
        <div className="flex items-center justify-center gap-4 my-4">
          <Link
            href={`/`}
            className="flex items-center uppercase bg-neutral-200 custom-inset gap-2 text-black text-xs font-medium justify-center px-4 py-2 rounded-md corner-squircle"
          >
            <Document weight="Bold" size={14} />
            <span>Book an Appointment</span>
          </Link>
          <Link
            href={`/?viewing=form`}
            className="flex items-center bg-black gap-2 text-white text-xs uppercase font-medium justify-center px-4 py-2 rounded-md corner-squircle"
          >
            <Document weight="Bold" size={14} />
            <span>Fill My Form</span>
          </Link>
        </div>
      </div>
      <Squiggle className="absolute hidden md:lg:xl:flex z-0 -right-30 rotate-180 text-blue-500/80" />
      <Squiggle className="absolute hidden md:lg:xl:flex z-0 -right-30 rotate-180 text-blue-500/10" />
      <Squiggle className="absolute hidden md:lg:xl:flex z-0 -right-30 rotate-180 text-blue-500/5" />
    </div>
  );
}

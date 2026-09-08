import { Document, MenuDots } from "@solar-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col relative">
      <div className="w-full fixed backdrop-blur-xl bg-transparent noise-subtle flex items-center justify-center">
        <div className="w-full md:lg:xl:w-4/6 bg-white py-5 px-5 border-x border-x-solid border-x-neutral-200 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            <Image src={logo} width={40} height={40} alt="logo" />
          </Link>
          <div className="flex md:lg:xl:hidden ">
            <button type="button" className="bg-neutral-200 p-2 rounded-md">
              <MenuDots size={16} className="rotate-90" weight="Bold" />
            </button>
          </div>
          <div className="md:lg:xl:flex items-center justify-end gap-6 hidden">
            <Link
              href={`/?viewing=about`}
              className="flex text-neutral-600 hover:text-neutral-950 items-center text-sm font-medium justify-center hover:underline"
            >
              About Us
            </Link>
            <Link
              href={`/?viewing=form`}
              className="flex text-neutral-600 hover:text-neutral-950 items-center text-sm font-medium justify-center hover:underline"
            >
              Book an appointment
            </Link>
            <Link
              href={`/?viewing=form`}
              className="flex items-center bg-black gap-2 text-white text-sm font-medium justify-center px-4 py-2 rounded-md corner-squircle"
            >
              <Document weight="Bold" size={14} />
              <span>Fill My Form</span>
            </Link>
          </div>
        </div>
      </div>
      <div
        id="workspace"
        className="w-full h-screen flex flex-col gap-7 items-center justify-center"
      >
        <Image
          src={logo}
          width={90}
          height={90}
          alt="logo"
          className="rotate-10"
        />
        <div className="flex flex-col items-center justify-center gap-5">
          <h1 className="text-5xl font-extrabold">Nippy Travels</h1>
          <span className="text-center text-xl font-bold text-neutral-800">
            Discover More, Travel Better.
          </span>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/`}
              className="flex items-center bg-white gap-2 text-black shadow text-sm font-medium justify-center px-4 py-2 rounded-md corner-squircle"
            >
              <Document weight="Bold" size={14} />
              <span>Book an Appointment</span>
            </Link>
            <Link
              href={`/?viewing=form`}
              className="flex items-center bg-black gap-2 text-white text-sm font-medium justify-center px-4 py-2 rounded-md corner-squircle"
            >
              <Document weight="Bold" size={14} />
              <span>Fill My Form</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute z-1 py-2 bottom-0 left-0 w-full flex items-center justify-center">
        <span className="text-xs text-neutral-700">
          Designed and Developed by{" "}
          <span className="text-fuchsia-500 underline cursor-pointer">
            @DisgruntledDevs
          </span>
        </span>
      </div>
    </div>
  );
}

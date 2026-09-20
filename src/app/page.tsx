import Image from "next/image";
import bg from "@/assets/images/Blue sky-2048x1236.png";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full font-title">
      <div className="w-full h-full bg-black/5 absolute -z-5" />
      <Image
        src={bg}
        alt="bg"
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        className="object-cover -z-10"
      />
      <div className="fixed px-10 py-5 z-1 top-0 w-full left-0 flex items-center justify-between">
        <Link href="/" className="text-lg font-medium uppercase">
          Nippy Travels
        </Link>
        <div className="flex items-center justify-end gap-6">
          <Link
            href="/"
            className="font-display hidden md:lg:xl:flex text-sm uppercase hover:underline font-medium transition"
          >
            Book an appointment
          </Link>
          <Link
            href={`/?viewing=form`}
            className="font-display uppercase text-xs font-bold text-black bg-white rounded-md corner-squircle px-5 py-2"
          >
            Fill My Form
          </Link>
        </div>
      </div>
      <div className="h-[55vh] gap-5 flex flex-col items-center justify-end py-20">
        <div className="flex flex-col items-center text-center justify-center gap-1">
          <h1 className="text-6xl font-bold uppercase">Nippy Travels</h1>
          <span className="text-3xl font-medium text-neutral-600 font-display">
            Travel Made Effortless
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 my-2">
          <Link
            href="/"
            className="bg-black font-display font-medium uppercase text-xs text-white rounded-sm corner-squircle px-5 py-1.5"
          >
            Book an Appointment
          </Link>
          <Link
            href={`/?viewing=form`}
            className="font-display px-5 py-1.5 rounded-sm bg-white uppercase font-bold text-xs shadow-lg"
          >
            Fill My Form
          </Link>
        </div>
      </div>
      <div className="w-full h-[45vh] px-5">
        <div className="bg-white shadow-[0_-8px_50px_10px_rgba(0,0,0,0.3)] border border-solid border-neutral-300 rounded-t-3xl p-5 h-full grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl flex flex-col bg-blue-50 p-6 md:col-span-2">
            <h2 className="text-2xl uppercase font-semibold">
              Visa Assistance
            </h2>
            <p className="mt-2 text-neutral-400 font-display">
              Find and book domestic or international flights that fit your
              schedule and budget. We help compare routes, airlines, fares, and
              baggage options before you travel.
            </p>
          </div>
          <div className="rounded-3xl bg-blue-50 p-6 md:col-span-1 md:row-span-3">
            <h2 className="text-xl font-semibold uppercase">
              Airport Transfers
            </h2>
            <p className="mt-2 text-neutral-400 font-display">
              Arrange reliable transportation between the airport, your hotel,
              and key destinations. Travel comfortably on arrival without
              worrying about unfamiliar routes or last-minute transport.
            </p>
          </div>
          <div className="rounded-2xl corner-squircle bg-blue-50 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold uppercase">
              Travel Consultation
            </h2>
            <p className="mt-2 text-neutral-400 font-display">
              Receive personalised advice on destinations, trip timing, budgets,
              travel requirements, and itineraries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

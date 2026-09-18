import { db } from "@/lib/db";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function FormsView({ searchParams }: Props) {
  const params = await searchParams;
  const page = +(params.page ?? "1");

  const forms = await db.query.form.findMany({
    offset: (page - 1) * 20,
    limit: 20,
  });

  if (forms.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-2xl text-neutral-500 font-bold">
          No Filled Forms Right Now
        </h1>
      </div>
    );
  }

  return (
    <div>
      {forms.map((form) => (
        <div
          key={form.id}
          className="w-full border-b border-b-solid border-b-neutral-200"
        >
          {JSON.stringify({ form })}
        </div>
      ))}
    </div>
  );
}

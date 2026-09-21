import { FormItem, Pagination } from "@/components";
import { db } from "@/lib/db";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const page = +(params.page ?? "1");

  const [paginated, allDocs] = await Promise.all([
    db.query.form.findMany({
      offset: (page - 1) * 20,
      limit: 20,
      orderBy: (fields, { desc }) => desc(fields.createdAt),
    }),
    db.query.form
      .findMany({
        columns: {
          id: true,
        },
      })
      .then((res) => res.length),
  ]);

  if (paginated.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h1 className="text-2xl text-neutral-500 font-bold">
          No Filled Forms Right Now
        </h1>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-2">
      <div className="w-full flex mb-3 items-center px-3 py-2 justify-between">
        <h1 className="font-bold text-2xl uppercase font-title">
          Filled Forms
        </h1>
        <Pagination currentPage={page} totalPages={Math.ceil(allDocs / 20)} />
      </div>
      {paginated.map((form) => (
        <FormItem form={form} key={form.id} />
      ))}
    </div>
  );
}

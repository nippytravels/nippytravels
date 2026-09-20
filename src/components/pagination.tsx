"use client";

import { ArrowLeft, ArrowRight } from "@solar-icons/react/ssr";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  //   onPageChangeAction: (page: number) => void;
};

function getPages(current: number, total: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const delta = 1;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      pages.push(i);
    } else if (i === current - delta - 1 || i === current + delta + 1) {
      pages.push("...");
    }
  }

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const pages = getPages(currentPage, totalPages);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    const newUrl = `${pathname}?${params.toString()}`;

    router.push(newUrl, { scroll: true });
  };

  return (
    <nav aria-label="Pagination" className="flex justify-center">
      <ul className="flex items-center gap-1">
        {/* Previous */}
        <li>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => navigateToPage(currentPage - 1)}
            className="p-2 flex items-center justify-center border text-xs
              bg-white text-neutral-700 border-neutral-200
              hover:bg-blue-100 hover:text-blue-500 hover:border-blue-200
              disabled:text-neutral-400 rounded-md disabled:cursor-not-allowed corner-squircle"
            aria-label="Previous page"
          >
            <ArrowLeft size={14} />
          </button>
        </li>
        {/* Pages */}
        {pages.map((page, index) => (
          <li key={index}>
            {page === "..." ? (
              <span className="p-2 text-foreground-400 text-sm">…</span>
            ) : (
              <button
                type="button"
                onClick={() => navigateToPage(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`px-2 py-1.25 border text-sm transition corner-squircle rounded-md
                  ${
                    page === currentPage
                      ? "bg-blue-100 text-blue-600 border-blue-200"
                      : "bg-white text-neutral-950 border-neutral-200 hover:bg-secondary-100 hover:text-blue-500 hover:border-blue-200"
                  }
                `}
              >
                {page}
              </button>
            )}
          </li>
        ))}
        {/* Next */}
        <li>
          <button
            type="button"
            onClick={() => navigateToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 flex items-center justify-center border text-xs
              bg-white text-foreground-700 border-neutral-200
              hover:bg-secondary-100 hover:text-secondary-500 hover:border-secondary-200
              disabled:text-foreground-400 rounded-md disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ArrowRight size={14} />
          </button>
        </li>
      </ul>
    </nav>
  );
}

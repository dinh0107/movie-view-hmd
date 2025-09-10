"use client";

import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | number>;
};

export default function Pagination({
  page,
  totalPages,
  basePath,
  query,
}: Props) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams({ ...query, page: p.toString() });
    return `${basePath}?${params.toString()}`;
  };

  const renderPages = () => {
    const pages: (number | string)[] = [];

    pages.push(1);

    if (page > 3) {
      pages.push("...");
    }

    for (let i = page - 1; i <= page + 1; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (page < totalPages - 2) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          className="px-3 py-1 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-red-500 hover:text-white transition"
        >
          Prev
        </Link>
      )}

      {renderPages().map((p, i) =>
        typeof p === "number" ? (
          <Link
            key={i}
            href={buildHref(p)}
            prefetch={false}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              p === page
                ? "bg-red-500 text-white font-semibold shadow"
                : "bg-gray-700 text-gray-200 hover:bg-red-400 hover:text-white"
            }`}
          >
            {p}
          </Link>
        ) : (
          <span key={i} className="px-2 text-gray-400">
            {p}
          </span>
        )
      )}

      {page < totalPages && (
        <Link
          href={buildHref(page + 1)}
          className="px-3 py-1 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-red-500 hover:text-white transition"
        >
          Next
        </Link>
      )}
    </div>
  );
}

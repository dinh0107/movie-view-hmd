"use client";

import { X } from "lucide-react";
import { useMenu } from "@/context/MenuContext";
import { useListUrl } from "@/hooks/useListUrl";
import { MovieCard } from "@/components/movie/MovieCard";
import { PageLoader } from "@/components/movie/PageLoader";
import { MoviePagination } from "@/components/movie/MoviePagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MovieListResult } from "@/lib/movie-list-types";

function Breadcrumb({ title }: { title: string }) {
  return (
    <div className="border-b border-border bg-gradient-to-b from-muted/50 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
      </div>
    </div>
  );
}

export default function MoviesPage({
  slug,
  initialData,
}: {
  slug: string;
  initialData: MovieListResult;
}) {
  const { page, setPage, getParam, setFilter, isPending } = useListUrl();
  const { categories } = useMenu();

  const category = getParam("category");
  const lang = getParam("sort_lang");
  const year = getParam("year");

  if (isPending) {
    return <PageLoader />;
  }

  return (
    <div className="page-shell pb-8">
      <Breadcrumb
        title={slug ? `Quốc gia: ${initialData.title}` : "Danh sách phim"}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-4">
          <FilterSelect
            value={category}
            placeholder="Thể loại"
            onChange={(v) => setFilter("category", v)}
            onClear={() => setFilter("category", "")}
          >
            {categories.map((item) => (
              <SelectItem key={item.slug ?? item.name} value={item.slug ?? ""}>
                {item.name}
              </SelectItem>
            ))}
          </FilterSelect>

          <FilterSelect
            value={lang}
            placeholder="Phụ đề"
            onChange={(v) => setFilter("sort_lang", v)}
            onClear={() => setFilter("sort_lang", "")}
          >
            <SelectItem value="vietsub">Vietsub</SelectItem>
            <SelectItem value="thuyet-minh">Thuyết minh</SelectItem>
            <SelectItem value="long-tieng">Lồng tiếng</SelectItem>
          </FilterSelect>

          <FilterSelect
            value={year}
            placeholder="Năm phát hành"
            onChange={(v) => setFilter("year", v)}
            onClear={() => setFilter("year", "")}
            contentClassName="max-h-60"
          >
            {Array.from({ length: 2025 - 1970 + 1 }, (_, i) => 2025 - i).map(
              (y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              )
            )}
          </FilterSelect>
        </div>

        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {initialData.movies.map((m) => (
              <MovieCard key={`${m.id}-${m.slug}`} movie={m} />
            ))}
          </div>

          {initialData.movies.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              Không có phim.
            </div>
          )}

          <MoviePagination
            page={page}
            totalPages={initialData.totalPages}
            onPageChange={setPage}
          />
        </section>
      </main>
    </div>
  );
}

function FilterSelect({
  value,
  placeholder,
  onChange,
  onClear,
  children,
  contentClassName,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onClear: () => void;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="relative flex-1 sm:flex-none">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-gray-900 text-white sm:w-[200px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={`bg-gray-900 text-white ${contentClassName ?? ""}`}>
          {children}
        </SelectContent>
      </Select>
      {value ? (
        <Button
          variant="ghost"
          className="absolute right-2 top-1/2 size-[18px] -translate-y-1/2 rounded-full bg-white p-0 text-red-500"
          onClick={onClear}
        >
          <X className="size-3" />
        </Button>
      ) : null}
    </div>
  );
}

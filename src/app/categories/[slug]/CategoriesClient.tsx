"use client";

import { useMenu } from "@/context/MenuContext";
import { useListUrl } from "@/hooks/useListUrl";
import { MovieCard } from "@/components/movie/MovieCard";
import { PageBreadcrumb } from "@/components/movie/PageBreadcrumb";
import { PageLoader } from "@/components/movie/PageLoader";
import { MovieListFilters } from "@/components/movie/MovieListFilters";
import { MoviePagination } from "@/components/movie/MoviePagination";
import type { MovieListResult } from "@/lib/movie-list-types";

export default function MoviesPage({
  slug,
  initialData,
}: {
  slug: string;
  initialData: MovieListResult;
}) {
  const { page, setPage, getParam, setFilter, isPending } = useListUrl();
  const { countries } = useMenu();

  const country = getParam("country");
  const lang = getParam("sort_lang");
  const year = getParam("year");

  if (isPending) {
    return <PageLoader />;
  }

  return (
    <div className="page-shell pb-8">
      <PageBreadcrumb
        subtitle="Thể loại"
        title={slug ? initialData.title : "Danh sách phim"}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <MovieListFilters
          country={country}
          lang={lang}
          year={year}
          countries={countries}
          onCountryChange={(v) => setFilter("country", v)}
          onLangChange={(v) => setFilter("sort_lang", v)}
          onYearChange={(v) => setFilter("year", v)}
        />

        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
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
      </div>
    </div>
  );
}

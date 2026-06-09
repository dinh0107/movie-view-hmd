"use client";

import React from "react";
import { apiGet } from "@/services/axiosClient";
import { useMenu } from "@/context/MenuContext";
import { MovieCard } from "@/components/movie/MovieCard";
import { PageBreadcrumb } from "@/components/movie/PageBreadcrumb";
import { PageLoader } from "@/components/movie/PageLoader";
import { MovieListFilters } from "@/components/movie/MovieListFilters";
import { MoviePagination } from "@/components/movie/MoviePagination";
import type { ListMovie, MovieListResult } from "@/lib/movie-list-types";

function mapItems(items: unknown[]): ListMovie[] {
  return items.map((raw) => {
    const item = raw as Record<string, unknown>;
    const poster = item.poster_url as string | undefined;
    const thumb = item.thumb_url as string | undefined;
    return {
      id: String(item._id ?? item.id ?? item.slug ?? ""),
      name: String(item.name ?? ""),
      slug: String(item.slug ?? ""),
      poster_url: poster
        ? /^https?:\/\//i.test(poster)
          ? poster
          : `https://phimimg.com/${poster.replace(/^\/+/, "")}`
        : "",
      thumb_url: thumb
        ? /^https?:\/\//i.test(thumb)
          ? thumb
          : `https://phimimg.com/${thumb.replace(/^\/+/, "")}`
        : "",
      year: Number(item.year) || 0,
      episode_current: String(item.episode_current ?? ""),
    };
  });
}

export default function MoviesPage({
  slug,
  initialData,
}: {
  slug: string;
  initialData: MovieListResult;
}) {
  const skipInitialFetch = React.useRef(true);

  const [movies, setMovies] = React.useState<ListMovie[]>(initialData.movies);
  const [page, setPage] = React.useState(initialData.page);
  const [totalPages, setTotalPages] = React.useState(initialData.totalPages);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [categoryTitle, setCategoryTitle] = React.useState(initialData.title);

  const [country, setCountry] = React.useState("");
  const [lang, setLang] = React.useState("");
  const [year, setYear] = React.useState("");

  const { countries } = useMenu();

  React.useEffect(() => {
    setMovies(initialData.movies);
    setPage(initialData.page);
    setTotalPages(initialData.totalPages);
    setCategoryTitle(initialData.title);
    setError(null);
    skipInitialFetch.current = true;
  }, [initialData, slug]);

  React.useEffect(() => {
    setMovies([]);
    setPage(1);
    setError(null);
  }, [country, lang, year]);

  React.useEffect(() => {
    if (!slug) return;

    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        const res = await apiGet<Record<string, unknown>>(
          `/the-loai/${slug}?page=${page}&limit=15` +
            (country ? `&country=${country}` : "") +
            (lang ? `&sort_lang=${lang}` : "") +
            (year ? `&year=${year}` : ""),
          { baseKey: "phim_v1" }
        );
        const data = (res?.data ?? {}) as Record<string, unknown>;

        setCategoryTitle(String(data.titlePage || slug));
        const params = data.params as Record<string, unknown> | undefined;
        const pagination = params?.pagination as
          | { totalPages?: number }
          | undefined;
        setTotalPages(pagination?.totalPages || page);

        const items = Array.isArray(data.items) ? data.items : [];
        setMovies(mapItems(items));

        const url = new URL(window.location.href);
        url.searchParams.set("page", String(page));
        window.history.replaceState({}, "", url.toString());
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Load thất bại";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug, page, country, lang, year]);

  if (loading && movies.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="page-shell pb-8">
      <PageBreadcrumb
        subtitle="Thể loại"
        title={slug ? categoryTitle : "Danh sách phim"}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <MovieListFilters
          country={country}
          lang={lang}
          year={year}
          countries={countries}
          onCountryChange={setCountry}
          onLangChange={setLang}
          onYearChange={setYear}
        />

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>

          {!loading && movies.length === 0 && !error && (
            <div className="py-20 text-center text-muted-foreground">
              Không có phim.
            </div>
          )}

          <MoviePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </section>
      </div>
    </div>
  );
}

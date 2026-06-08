"use client";

import React from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/services/axiosClient";
import { useMenu } from "@/context/MenuContext";
import { MovieCard } from "@/components/movie/MovieCard";
import { PageBreadcrumb } from "@/components/movie/PageBreadcrumb";
import { PageLoader } from "@/components/movie/PageLoader";
import { MovieListFilters } from "@/components/movie/MovieListFilters";
import { MoviePagination } from "@/components/movie/MoviePagination";

type ApiMovie = {
  id: string;
  name: string;
  slug: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  episode_current: string;
};

export default function MoviesPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [movies, setMovies] = React.useState<ApiMovie[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [categoryTitle, setCategoryTitle] = React.useState<string>("Movies");

  const [country, setCountry] = React.useState("");
  const [lang, setLang] = React.useState("");
  const [year, setYear] = React.useState("");

  const { countries } = useMenu();

  React.useEffect(() => {
    setMovies([]);
    setPage(1);
    setError(null);
  }, [slug, country, lang, year]);

  React.useEffect(() => {
    if (!slug) return;
    const run = async () => {
      try {
        setLoading(true);
        const res = await apiGet<any>(
          `/the-loai/${slug}?page=${page}&limit=15` +
            (country ? `&country=${country}` : "") +
            (lang ? `&sort_lang=${lang}` : "") +
            (year ? `&year=${year}` : ""),
          { baseKey: "phim_v1" }
        );
        const data = res?.data ?? {};

        setCategoryTitle(data.titlePage || slug);
        setTotalPages(data?.params?.pagination?.totalPages || page);

        const items =
          data.items?.map((item: any) => ({
            id: item._id || item.id,
            name: item.name,
            slug: item.slug,
            poster_url: item.poster_url
              ? `https://phimimg.com/${item.poster_url}`
              : "",
            thumb_url: item.thumb_url
              ? `https://phimimg.com/${item.thumb_url}`
              : "",
            year: Number(item.year) || 0,
            episode_current: item.episode_current || "",
          })) ?? [];

        setMovies(items);

        const url = new URL(window.location.href);
        url.searchParams.set("page", String(page));
        window.history.replaceState({}, "", url.toString());
      } catch (e: any) {
        setError(e?.message ?? "Load thất bại");
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

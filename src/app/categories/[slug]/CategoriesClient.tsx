"use client";
import React from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/services/axiosClient";
import { Loader2, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMenu } from "@/context/MenuContext";

type ApiMovie = {
  id: string;
  name: string;
  slug: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  episode_current: string;
};

function Breadcrumb({ title }: { title: string }) {
  return (
    <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
          {title}
        </h1>
      </div>
    </div>
  );
}

function MovieCard({ movie }: { movie: ApiMovie }) {
  const poster = movie.poster_url || movie.thumb_url;
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-lg">
      <a href={`/movies/${movie.slug}`} className="aspect-[2/3] w-full overflow-hidden">
        <img
          src={poster}
          alt={movie.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </a>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

      <div className="absolute top-2 left-2 flex items-center gap-2 flex-1">
        <span className="bg-black/60 text-white/80 text-xs px-2 py-0.5 rounded-md">
          {movie.year || "—"}
        </span>
        {movie.episode_current && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-md">
            {movie.episode_current}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-white font-semibold text-base line-clamp-4">
          {movie.name}
        </h3>
        <div className="mt-3">
          <a
            href={`/movies/${movie.slug}`}
            className="inline-flex items-center gap-2 flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow transition hover:bg-red-700"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="opacity-90"
            >
              <path d="M4 3l9 5-9 5V3z" />
            </svg>
            Xem ngay
          </a>
        </div>
      </div>
    </article>
  );
}

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

  return (
    <div className="min-h-screen pb-6 bg-black text-white">
      <Breadcrumb title={slug ? `Thể loại: ${categoryTitle}` : "Movies"} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1 relative">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="sm:w-[200px] !w-full bg-gray-900 text-white">
                <SelectValue placeholder="Quốc gia" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white">
                {countries.map((country) => (
                  <SelectItem
                    key={country?.slug ?? ""}
                    value={country.slug ?? ""}
                  >
                    {country?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {country && (
              <Button
                variant="ghost"
                className="text-red-500 cursor-pointer w-[18px] h-[18px] !p-0 right-2 rounded-full bg-white absolute top-1/2 transform -translate-y-1/2"
                onClick={() => setCountry("")}
              >
                <X />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 relative">
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger className="sm:w-[200px] !w-full bg-gray-900 text-white">
                <SelectValue placeholder="Phụ đề" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white">
                <SelectItem value="vietsub">Vietsub</SelectItem>
                <SelectItem value="thuyet-minh">Thuyết minh</SelectItem>
                <SelectItem value="long-tieng">Lồng tiếng</SelectItem>
              </SelectContent>
            </Select>

            {lang && (
              <Button
                variant="ghost"
                className="text-red-500 cursor-pointer w-[18px] h-[18px] !p-0 right-2 rounded-full bg-white absolute top-1/2 transform -translate-y-1/2"
                onClick={() => setLang("")}
              >
                <X />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 relative">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="sm:w-[200px] !w-full bg-gray-900 text-white">
                <SelectValue placeholder="Năm phát hành" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white max-h-60 overflow-y-auto">
                {Array.from(
                  { length: 2025 - 1970 + 1 },
                  (_, i) => 2025 - i
                ).map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {year && (
              <Button
                variant="ghost"
                className="text-red-500 cursor-pointer w-[18px] h-[18px] !p-0 right-2 rounded-full bg-white absolute top-1/2 transform -translate-y-1/2"
                onClick={() => setYear("")}
              >
                <X />
              </Button>
            )}
          </div>
        </div>

        {/* Movies */}
        {error && <div className="mb-4 text-sm text-red-300">{error}</div>}
        {loading && movies.length === 0 && (
          <main className="min-h-screen grid place-items-center text-white">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          </main>
        )}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>

          {!loading && movies.length === 0 && !error && (
            <div className="py-20 text-center text-white/70">
              Không có phim.
            </div>
          )}

          {/* Pagination */}
          {movies.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="text-red-500 hover:bg-red-600 hover:text-white"
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 5)
                    .map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={() => setPage(p)}
                          isActive={p === page}
                          className={
                            p === page
                              ? "bg-red-600 text-white border-none"
                              : "text-red-500 hover:bg-red-600 hover:text-white"
                          }
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {totalPages > 5 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="text-red-500 hover:bg-red-600 hover:text-white"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

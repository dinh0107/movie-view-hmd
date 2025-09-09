"use client";
import React from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/services/axiosClient";
import { Loader2, X } from "lucide-react";
import { useMenu } from "@/context/MenuContext";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { getListTitle, pickBaseKey, sanitizeSlug } from "@/lib/utils";

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

            <div className="absolute top-2 left-2 flex items-center gap-2">
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
                <h3 className="text-white font-semibold text-base line-clamp-2">
                    {movie.name}
                </h3>
                <div className="mt-3">
                    <a
                        href={`/movies/${movie.slug}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow transition hover:bg-red-700"
                    >
                        <svg width="16" height="16" fill="currentColor">
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
    const [categoryTitle, setCategoryTitle] = React.useState("Movies");

    // bộ lọc
    const [category, setCategory] = React.useState("");
    const [country, setCountry] = React.useState("");
    const [lang, setLang] = React.useState("");
    const [year, setYear] = React.useState("");

    const { categories, countries } = useMenu();

    // reset khi đổi slug hoặc filter
    React.useEffect(() => {
        setMovies([]);
        setPage(1);
        setError(null);
    }, [slug, category, country, lang, year]);

    React.useEffect(() => {
        if (!slug) return;

        const ac = new AbortController();
        let mounted = true;

        const run = async () => {
            try {
                setError(null);
                setLoading(true);

                const raw = slug ?? "";
                const cleanSlug = sanitizeSlug(raw);
                const baseKey = pickBaseKey(cleanSlug);

                const params = new URLSearchParams({
                    page: String(page),
                    limit: "15",
                });

                if (category) params.set("category", category);
                if (country) params.set("country", country);
                if (lang) params.set("sort_lang", lang);
                if (year) params.set("year", String(year));

                const url = `/danh-sach/${encodeURIComponent(cleanSlug)}?${params.toString()}`;

                const res = await apiGet<any>(url, {
                    baseKey,
                    fallbackBases: baseKey === "phim_v1" ? ["phim_root"] : undefined,
                });

                const data = baseKey === "phim_root" ? (res ?? {}) : (res?.data ?? {});

                if (!mounted) return;


                setCategoryTitle(
                    data?.titlePage ??
                    SLUG_MAP[cleanSlug] ??
                    toPretty(cleanSlug)
                );


                const total =
                    data?.params?.pagination?.totalPages ??
                    data?.pagination?.totalPages ??
                    1;
                setTotalPages(Number(total) > 0 ? Number(total) : 1);

                const items: any[] = Array.isArray(data?.items) ? data.items : [];

                setMovies(
                    items.map((item: any) => ({
                        id: item._id || item.id,
                        name: item.name,
                        slug: item.slug,
                        poster_url: item.poster_url ? normalizeImg(item.poster_url) : "",
                        thumb_url: item.thumb_url ? normalizeImg(item.thumb_url) : "",
                        year: Number(item.year) || 0,
                        episode_current: String(item.episode_current ?? ""),
                    }))
                );
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message ?? "Load thất bại");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        const normalizeImg = (p?: string) => {
            if (!p) return "";
            if (/^https?:\/\//i.test(p)) return p;
            const clean = p.replace(/^\/+/, "");
            return `https://phimimg.com/${clean}`;
        };

        run();

        return () => {
            mounted = false;
            ac.abort();
        };
    }, [slug, page, category, country, lang, year]);
    const SLUG_MAP: Record<string, string> = {
        "phim-moi-cap-nhat": "Phim mới cập nhật",
        "phim-le": "Phim lẻ",
        "phim-bo": "Phim bộ",
        "hoat-hinh": "Hoạt hình",
        "tv-shows": "TV Shows",
    };

    const toPretty = (s: string) =>
        s.replace(/^\/+|\/+$/g, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    const displayTitle =
        categoryTitle ??
        SLUG_MAP[slug] ??
        toPretty(slug);

    return (

        <div className="min-h-screen pb-6 bg-black text-white">
            <Breadcrumb title={slug ? `Danh sách: ${displayTitle}` : "Movies"} />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                {/* Filter bar */}
                <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-4 mb-6">
                    {/* Category */}
                    <div className="relative col-span-1">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-gray-900 text-white">
                                <SelectValue placeholder="Thể loại" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 text-white">
                                {categories.map((c, idx) => (
                                    <SelectItem key={idx} value={c.slug ?? ""}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {category && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 -translate-y-1/2 right-2 text-red-500 bg-white rounded-full w-5 h-5"
                                onClick={() => setCategory("")}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {/* Country */}
                    <div className="relative col-span-1">
                        <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-gray-900 text-white">
                                <SelectValue placeholder="Quốc gia" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 text-white max-h-60 overflow-y-auto">
                                {countries.map((c, idx) => (
                                    <SelectItem key={idx} value={c.slug ?? ""}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {country && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 -translate-y-1/2 right-2 text-red-500 bg-white rounded-full w-5 h-5"
                                onClick={() => setCountry("")}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {/* Subtitle / Language */}
                    <div className="relative col-span-1">
                        <Select value={lang} onValueChange={setLang}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-gray-900 text-white">
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
                                size="icon"
                                className="absolute top-1/2 -translate-y-1/2 right-2 text-red-500 bg-white rounded-full w-5 h-5"
                                onClick={() => setLang("")}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    {/* Year */}
                    <div className="relative col-span-1">
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-gray-900 text-white">
                                <SelectValue placeholder="Năm phát hành" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 text-white max-h-60 overflow-y-auto">
                                {Array.from({ length: 2025 - 1970 + 1 }, (_, i) => 2025 - i).map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {year && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 -translate-y-1/2 right-2 text-red-500 bg-white rounded-full w-5 h-5"
                                onClick={() => setYear("")}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Movies */}
                {error && <div className="mb-4 text-sm text-red-300">{error}</div>}
                {loading && movies.length === 0 && (
                    <div className="min-h-screen grid place-items-center text-white">
                        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                    </div>
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

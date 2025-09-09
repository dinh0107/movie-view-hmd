"use client";
import { normalizeTrailer } from "@/lib/utils";
import type {
  EpisodeServer,
  EpisodeSource,
  MovieDetail,
} from "@/services/apiService";
import { movieDetailService } from "@/services/apiService";
import { BadgeInfo, Clock, Film, Loader2, Play, Star, Tv } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";


export default function MovieDetailPage({ slug }: { slug: string }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "cast" | "photos" | "more" | "episodes"
  >("overview");
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [data, setData] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setData(null);

    movieDetailService
      .getMovieDetail(String(slug))
      .then((d) => setData(d))
      .catch((e: any) => {
        if (e?.name === "AbortError" || e?.code === "ERR_CANCELED") return;
        setError(e?.message || "Fetch error");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  const movie = useMemo(() => {
    if (!data) return null;
    const cast = (data.actor ?? []).map((name) => ({
      name,
      role: "",
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=111827&color=fff`,
    }));
    return {
      title: data.name,
      year: data.year ?? undefined,
      rating: data.rating ?? undefined,
      votes: "",
      duration: data.time ?? "",
      quality: data.quality ?? "HD",
      age: data.lang ?? "",
      genres: (data.category ?? [])
        .map((c) => ({
          name: c.name,
          slug: c.slug,
        }))
        .filter(Boolean),
      overview: data.content ?? "",
      backdrop: data.thumb_url,
      poster: data.poster_url,
      stills: [
        data.thumb_url,
        data.poster_url,
        data.thumb_url,
        data.poster_url,
      ].filter(Boolean) as string[],
      trailer: data.trailer_url || null,
      cast,
      slug: data.slug,
    };
  }, [data]);

  const trailerUrl = useMemo(
    () => normalizeTrailer(movie?.trailer || ""),
    [movie?.trailer]
  );

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
      </main>
    );
  }
  if (error || !movie) {
    return (
      <main className="min-h-screen grid place-items-center text-red-400">
        Lỗi: {error || "Không tìm thấy phim"}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0e13] text-white">
      {/* HERO */}
      <section className="relative">
        <img
          src={movie.backdrop}
          alt="Backdrop"
          className="w-full aspect-video md:aspect-[21/9] lg:aspect-[21/9] min-h-[400px] sm:min-h-[500px] md:min-h-[600px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e13] via-[#0b0e13]/60 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="relative -mt-28 grid grid-cols-1 gap-6 md:grid-cols-[240px,1fr] md:items-end">
            {/* Poster */}
            <div className="mx-auto w-[200px] md:w-[240px]">
              <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl">
                <img
                  src={movie.poster}
                  alt="Poster"
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
            </div>
            {/* Title & Meta */}
            <div className="pb-4 md:pb-6">
              <div className="flex flex-wrap items-center gap-3">
                {movie.quality && (
                  <span className="rounded-md bg-emerald-600/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
                    {movie.quality}
                  </span>
                )}
                {movie.age && (
                  <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10">
                    {movie.age}
                  </span>
                )}
                {typeof movie.rating === "number" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-amber-300 ring-1 ring-white/10">
                    <Star className="h-4 w-4" /> {movie.rating}
                  </span>
                )}
                {movie.votes && (
                  <span className="text-xs text-white/60">
                    {movie.votes} votes
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                {movie.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/70">
                {movie.duration && (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {movie.duration}
                    </span>
                    <span>•</span>
                  </>
                )}
                {movie.year && <span>{movie.year}</span>}
                {movie.genres?.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="inline-flex flex-wrap gap-2">
                      {movie.genres.map((g) => (
                        <Link
                          key={g.slug}
                          href={`/categories/${g.slug}`}
                          className="rounded-full bg-white/5 px-3 py-1 text-xs ring-1 ring-white/10 hover:bg-white/10"
                        >
                          {g.name}
                        </Link>
                      ))}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {movie.trailer && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <Play className="h-5 w-5" /> Xem trailer
                  </button>
                )}
                <Link
                  href={`/watch/${movie.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <Tv className="h-5 w-5" /> Xem ngay
                </Link>
                {/* <button
                  onClick={() => setLike((v) => !v)}
                  className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold focus:outline-none focus:ring-2 ${
                    like
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 focus:ring-rose-400"
                      : "bg-white/10 text-white hover:bg-white/15 focus:ring-white/30"
                  }`}
                >
                  <Heart className="h-5 w-5" />{" "}
                  {like ? "Đã thích" : "Yêu thích"}
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-8">
        <div className="no-scrollbar flex overflow-x-auto rounded-xl bg-white/5 p-1 ring-1 ring-white/10 gap-2">
          {[
            {
              key: "overview",
              label: "Tổng quan",
              icon: <BadgeInfo className="h-4 w-4" />,
            },
            { key: "episodes", label: "Tập", icon: <Tv className="h-4 w-4" /> },
            {
              key: "cast",
              label: "Diễn viên",
              icon: <Film className="h-4 w-4" />,
            },
            // { key: 'photos', label: 'Ảnh', icon: <ChevronRight className="h-4 w-4 rotate-90" /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`mr-1 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                activeTab === (t.key as any)
                  ? "bg-white text-black shadow"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <Overview
              overview={movie.overview}
              stills={movie.stills.slice(0, 6)}
            />
          )}
          {activeTab === "episodes" && data?.episodes && (
            <EpisodesPanel
              slug={String(slug)}
              servers={data.episodes}
              onPlay={({ serverIdx, epIdx }) => {
                router.push(`/watch/${slug}?server=${serverIdx}&ep=${epIdx}`);
              }}
            />
          )}
          {activeTab === "cast" && <CastList cast={movie.cast} />}
          {/* {activeTab === 'photos' && <PhotoGrid stills={movie.stills} />} */}
          {activeTab === "more" && <MoreCarousel items={[]} />}
        </div>
      </div>

      {trailerOpen && trailerUrl && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black">
            <div className="aspect-video w-full">
              <iframe
                key={trailerUrl} // force reload khi URL đổi
                className="h-full w-full"
                src={trailerUrl}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setTrailerOpen(false)}
              className="absolute right-3 top-3 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      <div className="py-10" />
    </main>
  );
}

function EpisodesPanel({
  slug,
  servers,
  pageSize = 40,
  onPlay,
}: {
  slug: string;
  servers: EpisodeServer[];
  pageSize?: number;
  onPlay?: (args: {
    serverIdx: number;
    epIdx: number;
    src: EpisodeSource;
  }) => void;
}) {
  const [serverIdx, setServerIdx] = useState(0);
  const [page, setPage] = useState(1);

  const [perPage, setPerPage] = useState(pageSize);
  useEffect(() => setPerPage(pageSize), [pageSize]);

  const currentServer = servers[serverIdx] ?? {
    server_name: "Server",
    server_data: [],
  };

  const sortedEpisodes = useMemo(() => {
    const getNum = (s?: string) => {
      const m = String(s ?? "").match(/\d+/);
      return m ? parseInt(m[0], 10) : Number.POSITIVE_INFINITY;
    };
    return [...(currentServer.server_data ?? [])].sort(
      (a, b) => getNum(a.name) - getNum(b.name)
    );
  }, [currentServer.server_data]);

  const total = sortedEpisodes.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const view = sortedEpisodes.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [serverIdx]);

  const handleIncreasePerPage = () => {
    setPerPage((n) => n + 40);
    setPage(1);
  };

  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/80">
        <span className="mr-2">Server:</span>
        <select
          value={serverIdx}
          onChange={(e) => setServerIdx(Number(e.target.value))}
          className="bg-white/10 text-white rounded-md px-2 py-1 ring-1 ring-white/10 cursor-pointer"
        >
          {servers.map((s, i) => (
            <option key={i} value={i} className="bg-slate-900">
              {s.server_name ?? `Server ${i + 1}`}
            </option>
          ))}
        </select>

        <span className="ml-auto" />
        <span>
          Hiển thị: <b>{view.length}</b>/<b>{total}</b> • Mỗi trang:{" "}
          <b>{perPage}</b>
        </span>

        <button
          onClick={handleIncreasePerPage}
          className="ml-2 rounded-md bg-white/10 px-3 py-1 ring-1 ring-white/10 hover:bg-white/15 cursor-pointer"
          title="Tăng thêm 40/t trang"
        >
          +40
        </button>

        {/* Tuỳ chọn: nhanh chọn 40/80/120/All */}
        {/* <div className="flex gap-1">
          {[40, 80, 120].map((n) => (
            <button key={n} onClick={() => { setPerPage(n); setPage(1); }}
              className={`rounded-md px-2 py-1 ring-1 ring-white/10 ${perPage===n?'bg-emerald-500 text-white':'bg-white/10 hover:bg-white/15'}`}>
              {n}
            </button>
          ))}
          <button onClick={() => { setPerPage(total || 9999); setPage(1); }}
            className="rounded-md px-2 py-1 ring-1 ring-white/10 bg-white/10 hover:bg-white/15">
            All
          </button>
        </div> */}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
        {view.map((ep, i) => {
          const epIdx = start + i;
          return (
            <button
              key={`${servers[serverIdx]?.server_name}-${epIdx}-${ep.name}`}
              onClick={() => onPlay?.({ serverIdx, epIdx, src: ep })}
              className="h-10 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold ring-1 cursor-pointer ring-white/10"
              title={ep.name ?? `Tập ${epIdx + 1}`}
            >
              {ep.name ?? `Tập ${epIdx + 1}`}
            </button>
          );
        })}
      </div>

      {total > perPage && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md bg-white/10 px-3 py-1 ring-1 ring-white/10 disabled:opacity-50 cursor-pointer"
          >
            Trước
          </button>
          <span className="text-white/70 text-sm cursor-pointer">
            Trang {page} / {Math.max(1, Math.ceil(total / perPage))}
          </span>
          <button
            disabled={end >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md bg-white/10 px-3 py-1 ring-1 ring-white/10 disabled:opacity-50 cursor-pointer"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}

function Overview({
  overview,
  stills,
}: {
  overview: string;
  stills: string[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr,380px]">
      <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
        <h2 className="text-xl font-semibold">Nội dung phim</h2>
        <p className="mt-3 text-white/80 leading-7">{overview}</p>
      </div>

      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stills.map((s, i) => (
            <div key={i} className="overflow-hidden rounded-xl">
              <img
                src={s}
                alt={`still-${i}`}
                className="aspect-video w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/30 p-3 ring-1 ring-white/10">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  );
}

function CastList({
  cast,
}: {
  cast: { name: string; role?: string; img: string }[];
}) {
  if (!cast?.length)
    return (
      <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
        Chưa có dữ liệu diễn viên.
      </div>
    );
  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <h2 className="mb-4 text-xl font-semibold">Diễn viên</h2>
      <div className="no-scrollbar grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cast.map((c) => (
          <div
            key={c.name}
            className="group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
          >
            <img
              src={c.img}
              alt={c.name}
              className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.03]"
            />
            <div className="p-3">
              <p className="font-semibold leading-tight">{c.name}</p>
              {c.role ? (
                <p className="text-sm text-white/60">{c.role}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoGrid({ stills }: { stills: string[] }) {
  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <h2 className="mb-4 text-xl font-semibold">Thư viện ảnh</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {stills.map((s, i) => (
          <div key={i} className="overflow-hidden rounded-2xl">
            <img
              src={s}
              alt={`still-${i}`}
              className="aspect-video w-full object-cover transition hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function MoreCarousel({
  items,
}: {
  items: { title: string; year: number; img: string }[];
}) {
  if (!items.length)
    return (
      <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
        Chưa có đề xuất.
      </div>
    );
  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <h2 className="mb-4 text-xl font-semibold">Có thể bạn cũng thích</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto">
        {items.map((m) => (
          <div
            key={m.title}
            className="min-w-[180px] max-w-[180px] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
          >
            <img
              src={m.img}
              alt={m.title}
              className="aspect-[2/3] w-full object-cover"
            />
            <div className="p-3">
              <p className="line-clamp-1 font-semibold">{m.title}</p>
              <p className="text-sm text-white/60">{m.year}</p>
              <button className="mt-2 w-full rounded-lg bg-white/10 py-1.5 text-sm font-semibold hover:bg-white/15">
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

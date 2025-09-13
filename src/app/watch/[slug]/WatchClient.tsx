"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Hls from "hls.js";
import { movieDetailService, movieService } from "@/services/apiService";
import type { EpisodeServer, EpisodeSource, MovieDetail } from "@/services/apiService";
import { Play, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import CategorySwiper from "@/components/sections/CategorySwiper";
import { normalizeImage } from "@/lib/utils";

export default function WatchPage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const [related, setRelated] = useState<any[]>([]);
  const HISTORY_KEY = slug ? `watch:${slug}` : "";

  const parseIntSafe = (v: any, fallback = 0) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 ? n : fallback;
  };

  const urlServer = parseIntSafe(search.get("server"), NaN);
  const urlEp = parseIntSafe(search.get("ep"), NaN);

  const [serverIdx, setServerIdx] = useState<number>(() => {
    if (!Number.isNaN(urlServer)) return urlServer;
    if (typeof window !== "undefined" && HISTORY_KEY) {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { serverIdx: number; epIdx: number };
          return parseIntSafe(saved.serverIdx, 0);
        }
      } catch { }
    }
    return 0;
  });

  const [epIdx, setEpIdx] = useState<number>(() => {
    if (!Number.isNaN(urlEp)) return urlEp;
    if (typeof window !== "undefined" && HISTORY_KEY) {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { serverIdx: number; epIdx: number };
          return parseIntSafe(saved.epIdx, 0);
        }
      } catch { }
    }
    return 0;
  });

  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==== NEW: resume keys & states ====
  const POS_KEY = slug != null ? `watchpos:${slug}:${serverIdx}:${epIdx}` : "";
  const [savedPos, setSavedPos] = useState<number | null>(null);
  const [askResume, setAskResume] = useState(false);
  const [resumeAt, setResumeAt] = useState<number | null>(null);

  // Fetch movie detail
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setDetail(null);

    movieDetailService
      .getMovieDetail(String(slug))
      .then((d) => setDetail(d))
      .catch((e: any) => {
        if (e?.name === "AbortError" || e?.code === "ERR_CANCELED") return;
        setError(e?.message || "Fetch error");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  // Guard server/ep when detail changes
  useEffect(() => {
    if (!detail?.episodes?.length) return;
    if (serverIdx >= detail.episodes.length) setServerIdx(0);
    const eps = detail.episodes[serverIdx]?.server_data ?? [];
    if (epIdx >= eps.length) setEpIdx(0);
  }, [detail, serverIdx, epIdx]);

  // Sync URL with server/ep
  useEffect(() => {
    if (!slug) return;
    const params = new URLSearchParams();
    params.set("server", String(serverIdx));
    params.set("ep", String(epIdx));
    router.replace(`/watch/${slug}?${params.toString()}`);
  }, [slug, serverIdx, epIdx, router]);

  // Save last chosen server/ep for this movie
  useEffect(() => {
    if (!HISTORY_KEY) return;
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify({ serverIdx, epIdx, t: Date.now() })
      );
    } catch { }
  }, [HISTORY_KEY, serverIdx, epIdx]);

  // Related movies
  useEffect(() => {
    if (!detail?.category?.length) return;
    Promise.all(
      detail.category.map((cat) =>
        movieService.getMoviesByCategory(cat.slug ?? "").catch(() => [])
      )
    ).then((lists) => {
      const merged = lists.flat();
      const unique = merged.filter(
        (m, i, arr) => arr.findIndex((x) => x.slug === m.slug) === i
      );
      const filtered = unique.filter((m) => m.slug !== detail.slug);
      setRelated(filtered);
    });
  }, [detail]);

  // FB comments re-parse
  useEffect(() => {
    if (window.FB) window.FB.XFBML.parse();
  }, [detail?.slug]);

  // Build playable & title
  const servers: EpisodeServer[] = detail?.episodes ?? [];
  const eps: EpisodeSource[] = servers[serverIdx]?.server_data ?? [];
  const currentEp = eps[epIdx];

  const [visible, setVisible] = useState(40);
  const view = useMemo(() => eps.slice(0, visible), [eps, visible]);
  const playable = useMemo(
    () => ({
      m3u8: currentEp?.link_m3u8 || null,
      embed: currentEp?.link_embed || null,
    }),
    [currentEp]
  );

  const pageTitle = useMemo(() => {
    if (!detail) return "Xem phim online";
    const movieName = detail.name;
    const episodeName = eps[epIdx]?.name || `Tập ${epIdx + 1}`;
    const serverName = servers[serverIdx]?.server_name;
    return `Xem ${movieName} ${episodeName}${serverName ? ` - ${serverName}` : ""} | Phim HD Vietsub`;
  }, [detail, eps, epIdx, servers, serverIdx]);

  // ==== NEW: load saved position & show popup if >= 10s ====
  useEffect(() => {
    if (!POS_KEY) return;
    try {
      const raw = localStorage.getItem(POS_KEY);
      const n = raw ? Math.max(0, Math.floor(Number(raw))) : 0;
      if (n >= 10) {
        setSavedPos(n);
        setAskResume(true);
      } else {
        setSavedPos(null);
        setAskResume(false);
      }
      setResumeAt(null); // reset seek target when ep/server changes
    } catch { }
  }, [POS_KEY]);

  // ==== NEW: save progress callback ====
  const handleProgressSave = (t: number) => {
    if (!POS_KEY) return;
    try {
      if (t <= 0 || Number.isNaN(t)) {
        localStorage.removeItem(POS_KEY);
      } else {
        localStorage.setItem(POS_KEY, String(Math.floor(t)));
      }
    } catch { }
  };

  if (loading)
    return (
      <main className="min-h-screen grid place-items-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
      </main>
    );

  if (error || !detail)
    return (
      <main className="min-h-screen grid place-items-center text-red-400">
        Lỗi: {error || "Không tìm thấy dữ liệu"}
      </main>
    );

  return (
    <main className="max-w-7xl mx-auto bg-[#0b0e13] text-white py-3">
      {/* ==== NEW: Popup hỏi tiếp tục xem (khi mở -> không autoplay) ==== */}
      {askResume && savedPos != null && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center">
          <div className="w-[92%] max-w-md rounded-2xl bg-[#141823] p-5 ring-1 ring-white/10">
            <h3 className="text-lg font-semibold mb-2">Tiếp tục xem?</h3>
            <p className="text-white/80 mb-4">
              Bạn đã xem đến{" "}
              <span className="font-semibold">
                {new Date(savedPos * 1000).toISOString().substring(11, 19)}
              </span>
              . Bạn muốn xem tiếp từ mốc này?
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setAskResume(false);
                  setResumeAt(0);
                  try { localStorage.removeItem(POS_KEY); } catch { }
                }}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/10"
              >
                Xem từ đầu
              </button>
              <button
                onClick={() => {
                  setAskResume(false);
                  setResumeAt(savedPos);
                }}
                className="px-4 py-2 rounded-lg bg-white text-black font-semibold"
              >
                Xem tiếp
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        {/* H1 SEO */}
        <h1 className="text-2xl md:text-3xl font-bold text-white">{pageTitle}</h1>

        {/* Breadcrumb */}
        <nav className="mt-2 text-sm text-white/60" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="hover:text-white">Trang chủ</a>
            </li>
            <li>›</li>
            <li>
              <a href={`/movie/${detail.slug}`} className="hover:text-white">
                {detail.name}
              </a>
            </li>
            <li>›</li>
            <li className="text-white/80">{eps[epIdx]?.name || `Tập ${epIdx + 1}`}</li>
          </ol>
        </nav>
      </div>

      {/* Player */}
      <div className="container mx-auto px-4">
        <div className="aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-white/10 bg-black">
          <SmartPlayer
            m3u8={playable.m3u8}
            embed={playable.embed}
            title={detail.name}
            resumeAt={resumeAt ?? 0}
            onProgressSave={handleProgressSave}
            // Khi popup mở -> KHÔNG autoplay
            canAutoPlay={!askResume}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-4 mt-4 grid gap-4 md:grid-cols-[280px,1fr]">
        {/* Servers */}
        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <h2 className="text-xl font-semibold mb-2">Máy chủ</h2>
          <div className="flex flex-wrap gap-2">
            {servers.map((sv, i) => (
              <button
                key={`${sv.server_name}-${i}`}
                onClick={() => setServerIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ring-1 transition ${i === serverIdx
                  ? "bg-white text-black ring-white/10"
                  : "text-white/80 bg-white/5 hover:bg-white/10 ring-white/10"
                  }`}
              >
                {sv.server_name}
              </button>
            ))}
          </div>
        </div>

        {/* Episodes */}
        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Danh sách tập</h2>
            <div className="flex items-center gap-2">
              {eps.length > 40 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVisible((v) => Math.min(eps.length, v + 40))}
                    disabled={visible >= eps.length}
                    className="px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/10 disabled:opacity-50"
                  >
                    +40
                  </button>
                  <button
                    onClick={() => setVisible(eps.length)}
                    disabled={visible >= eps.length}
                    className="px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/10 disabled:opacity-50"
                  >
                    All
                  </button>
                </div>
              )}

              <button
                onClick={() => setEpIdx((v) => Math.max(0, v - 1))}
                disabled={epIdx <= 0}
                className="p-2 rounded-lg bg-white/10 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEpIdx((v) => Math.min((eps.length || 1) - 1, v + 1))}
                disabled={epIdx >= eps.length - 1}
                className="p-2 rounded-lg bg-white/10 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List episode */}
          {eps.length === 0 ? (
            <div className="text-white/70">Chưa có dữ liệu tập của máy chủ này.</div>
          ) : (
            <>
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {view.map((ep, i) => (
                  <button
                    key={`${i}-${ep.name}`}
                    onClick={() => setEpIdx(i)}
                    className={`h-10 rounded-lg text-sm cursor-pointer font-semibold ring-1 ring-white/10 transition ${i === epIdx ? "bg-white text-black" : "bg-white/10 hover:bg-white/15"
                      }`}
                  >
                    {ep.name ?? `Tập ${i + 1}`}
                  </button>
                ))}
              </div>
              {visible < eps.length && (
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() => setVisible((v) => Math.min(eps.length, v + 40))}
                    className="px-4 py-2 rounded-lg bg-white/10 ring-1 ring-white/10 hover:bg-white/15"
                  >
                    Tải thêm 40
                  </button>
                  <button
                    onClick={() => setVisible(eps.length)}
                    className="px-4 py-2 rounded-lg bg-white/10 ring-1 ring-white/10 hover:bg-white/15"
                  >
                    Hiển thị tất cả
                  </button>
                </div>
              )}
              {eps.length > 40 && (
                <p className="mt-5 text-center text-xs text-white/60">
                  Đang hiển thị {Math.min(visible, eps.length)}/{eps.length} tập
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Nội dung phim */}
      <div className="container mx-auto px-4 mt-6">
        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <h2 className="text-xl font-semibold mb-2">Nội dung phim</h2>
          <p className="text-white/80 leading-7">{detail.content || "—"}</p>
        </div>
      </div>

      {/* Phim liên quan */}
      <div className="container mx-auto px-4 pt-2">
        {detail.genres && detail.genres.length > 0 && related.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Phim liên quan</h2>
            <CategorySwiper
              movies={related.map((m) => ({
                id: m.id,
                title: m.name,
                slug: m.slug,
                poster: normalizeImage(m.poster_url),
                year: m.year,
              }))}
            />
          </>
        )}
      </div>
      <div className="py-10" />
    </main>
  );
}

/* ================= SmartPlayer & HlsVideo ================= */

function SmartPlayer({
  m3u8,
  embed,
  title,
  resumeAt = 0,
  onProgressSave,
  canAutoPlay = true,
}: {
  m3u8: string | null;
  embed: string | null;
  title: string;
  resumeAt?: number;
  onProgressSave?: (t: number) => void;
  canAutoPlay?: boolean;
}) {
  if (m3u8)
    return (
      <HlsVideo
        src={m3u8}
        title={title}
        resumeAt={resumeAt}
        onProgressSave={onProgressSave}
        canAutoPlay={canAutoPlay}
      />
    );

  if (embed) {
    // Không chèn autoplay param khi canAutoPlay=false
    const url = canAutoPlay ? withAutoplay(embed) : embed;
    return (
      <iframe
        key={url}
        src={url}
        title={title}
        className="h-full w-full"
        allow={
          canAutoPlay
            ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            : "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        }
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <div className="h-full w-full grid place-items-center text-white/70">
      <div className="flex items-center gap-2">
        <Play className="w-5 h-5" /> Không có nguồn phát.
      </div>
    </div>
  );
}

function HlsVideo({
  src,
  title,
  resumeAt = 0,
  onProgressSave,
  canAutoPlay = true,
}: {
  src: string;
  title: string;
  resumeAt?: number;
  onProgressSave?: (t: number) => void;
  canAutoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (canAutoPlay) video.autoplay = true;

    const trySeek = () => {
      if (!video) return;
      if (resumeAt && resumeAt > 0) {
        try {
          if (video.readyState >= 1) {
            video.currentTime = resumeAt;
          } else {
            const onMeta = () => {
              video.currentTime = resumeAt;
              video.removeEventListener("loadedmetadata", onMeta);
            };
            video.addEventListener("loadedmetadata", onMeta);
          }
        } catch { }
      }
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      trySeek();
      if (canAutoPlay) video.play().catch(() => { });
      return () => {
        video.removeAttribute("src");
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 60 });
      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(src));
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        trySeek();
        if (canAutoPlay) video.play().catch(() => { });
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
          }
        }
      });

      return () => {
        try { hlsRef.current?.destroy(); } catch { }
      };
    }
  }, [src, resumeAt, canAutoPlay]);

  // Save progress (throttle ~5s), flush on leave/end
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastSaved = -5;
    const onTime = () => {
      const t = video.currentTime || 0;
      if (!onProgressSave) return;
      if (t - lastSaved >= 5) {
        lastSaved = t;
        onProgressSave(t);
      }
    };
    const onEnded = () => onProgressSave?.(0);
    const onBeforeUnload = () => onProgressSave?.(video.currentTime || 0);
    const onHide = () => {
      if (document.hidden) onBeforeUnload();
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [onProgressSave]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full"
      controls
      playsInline
      preload="auto"
      poster=""
      aria-label={title}
      muted
      {...(canAutoPlay ? { autoPlay: true } : {})}
    />
  );
}

function withAutoplay(u: string) {
  try {
    const url = new URL(u);
    if (!url.searchParams.has("autoplay")) url.searchParams.set("autoplay", "1");
    if (url.hostname.includes("youtube.com")) url.searchParams.set("rel", "0");
    return url.toString();
  } catch {
    return u + (u.includes("?") ? "&" : "?") + "autoplay=1";
  }
}

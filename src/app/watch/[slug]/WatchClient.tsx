"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Hls from "hls.js";
import { movieDetailService } from "@/services/apiService";
import type {
  EpisodeServer,
  EpisodeSource,
  MovieDetail,
} from "@/services/apiService";
import { Play, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function WatchPage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();

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
      } catch {}
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
      } catch {}
    }
    return 0;
  });

  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!detail?.episodes?.length) return;
    if (serverIdx >= detail.episodes.length) setServerIdx(0);
    const eps = detail.episodes[serverIdx]?.server_data ?? [];
    if (epIdx >= eps.length) setEpIdx(0);
  }, [detail, serverIdx, epIdx]);

  useEffect(() => {
    if (!slug) return;
    const params = new URLSearchParams();
    params.set("server", String(serverIdx));
    params.set("ep", String(epIdx));
    router.replace(`/watch/${slug}?${params.toString()}`);
  }, [slug, serverIdx, epIdx, router]);

  useEffect(() => {
    if (!HISTORY_KEY) return;
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify({ serverIdx, epIdx, t: Date.now() })
      );
    } catch {}
  }, [HISTORY_KEY, serverIdx, epIdx]);

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
    <main className="min-h-screen bg-[#0b0e13] text-white py-3">
      <div className="container mx-auto px-4">
        <div className="aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-white/10 bg-black">
          <SmartPlayer
            m3u8={playable.m3u8}
            embed={playable.embed}
            title={detail.name}
          />
        </div>
      </div>
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl md:text-2xl font-bold">
          {detail.name}{" "}
          <span className="text-white/60">
            • {eps[epIdx]?.name || `Tập ${epIdx + 1}`}
          </span>
        </h1>
      </div>
      {/* Controls */}
      <div className="container mx-auto px-4 mt-4 grid gap-4 md:grid-cols-[280px,1fr]">
        {/* Servers */}
        <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <h3 className="font-semibold mb-2">Máy chủ</h3>
          <div className="flex flex-wrap gap-2">
            {servers.map((sv, i) => (
              <button
                key={`${sv.server_name}-${i}`}
                onClick={() => setServerIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ring-1 transition ${
                  i === serverIdx
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
            <h3 className="font-semibold">Danh sách tập</h3>
            <div className="flex items-center gap-2">
              {/* nút tăng số lượng hiển thị */}
              <button
                onClick={() => setVisible((v) => Math.min(eps.length, v + 40))}
                disabled={visible >= eps.length}
                className="px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/10 disabled:opacity-50"
                title="Hiển thị thêm 40 tập"
              >
                +40
              </button>
              <button
                onClick={() => setVisible(eps.length)}
                disabled={visible >= eps.length}
                className="px-3 py-2 rounded-lg bg-white/10 ring-1 ring-white/10 disabled:opacity-50"
                title="Hiển thị tất cả tập"
              >
                All
              </button>

              <button
                onClick={() => setEpIdx((v) => Math.max(0, v - 1))}
                disabled={epIdx <= 0}
                className="p-2 rounded-lg bg-white/10 disabled:opacity-50"
                title="Tập trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setEpIdx((v) => Math.min((eps.length || 1) - 1, v + 1))
                }
                disabled={epIdx >= eps.length - 1}
                className="p-2 rounded-lg bg-white/10 disabled:opacity-50 cursor-pointer"
                title="Tập sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {eps.length === 0 ? (
            <div className="text-white/70">
              Chưa có dữ liệu tập của máy chủ này.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {view.map((ep, i) => (
                  <button
                    key={`${i}-${ep.name}`}
                    onClick={() => setEpIdx(i)}
                    className={`h-10 rounded-lg text-sm cursor-pointer font-semibold ring-1 ring-white/10 transition ${
                      i === epIdx
                        ? "bg-white text-black"
                        : "bg-white/10 hover:bg-white/15"
                    }`}
                    title={ep.name ?? `Tập ${i + 1}`}
                  >
                    {ep.name ?? `Tập ${i + 1}`}
                  </button>
                ))}
              </div>

              {visible < eps.length && (
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() =>
                      setVisible((v) => Math.min(eps.length, v + 40))
                    }
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
              <p className="mt-5 text-center text-xs text-white/60">
                Đang hiển thị {Math.min(visible, eps.length)}/{eps.length} tập
              </p>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <h3 className="font-semibold mb-2">Nội dung</h3>
          <p className="text-white/80 leading-7">{detail.content || "—"}</p>
        </div>
      </div>

      <div className="py-10" />
    </main>
  );
}

function SmartPlayer({
  m3u8,
  embed,
  title,
}: {
  m3u8: string | null;
  embed: string | null;
  title: string;
}) {
  if (m3u8) return <HlsVideo src={m3u8} title={title} />;
  if (embed) {
    const url = withAutoplay(embed);
    return (
      <iframe
        key={url}
        src={url}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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

function HlsVideo({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 60 });
      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(src));
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
    }

    return () => {
      try {
        hlsRef.current?.destroy();
      } catch {}
      if (video) video.removeAttribute("src");
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full"
      controls
      playsInline
      preload="auto"
      poster=""
      aria-label={title}
    />
  );
}

function withAutoplay(u: string) {
  try {
    const url = new URL(u);
    if (!url.searchParams.has("autoplay"))
      url.searchParams.set("autoplay", "1");
    if (url.hostname.includes("youtube.com")) url.searchParams.set("rel", "0");
    return url.toString();
  } catch {
    return u + (u.includes("?") ? "&" : "?") + "autoplay=1";
  }
}

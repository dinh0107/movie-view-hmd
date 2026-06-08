"use client";

import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import { Play } from "lucide-react";

type VideoPlayerProps = {
  m3u8: string | null;
  embed: string | null;
  title: string;
  poster?: string | null;
};

export function VideoPlayer({
  m3u8,
  embed,
  title,
  poster,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);
  const [useEmbed, setUseEmbed] = useState(false);

  useEffect(() => {
    setUseEmbed(false);
  }, [m3u8, embed]);

  useEffect(() => {
    if (useEmbed || !m3u8 || !containerRef.current) return;

    const container = containerRef.current;
    const art = new Artplayer({
      container,
      url: m3u8,
      type: "m3u8",
      poster: poster || undefined,
      autoplay: true,
      autoSize: true,
      autoMini: true,
      fullscreen: true,
      fullscreenWeb: true,
      pip: true,
      playbackRate: true,
      setting: true,
      flip: true,
      theme: "#dc2626",
      lang: navigator.language?.startsWith("vi") ? "vi" : "en",
      moreVideoAttr: {
        crossOrigin: "anonymous",
        playsInline: true,
      },
      customType: {
        m3u8(video, url, player) {
          const onFatal = () => {
            player.destroy(false);
            if (embed) setUseEmbed(true);
          };

          if (Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 30,
              enableWorker: true,
              backBufferLength: 60,
            });
            hls.loadSource(url);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, (_, data) => {
              if (!data.fatal) return;
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (
                    data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                    data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT ||
                    data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR
                  ) {
                    hls.destroy();
                    onFatal();
                  } else {
                    hls.startLoad();
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  hls.destroy();
                  onFatal();
                  break;
              }
            });

            player.on("destroy", () => hls.destroy());
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.addEventListener("error", onFatal, { once: true });
          } else if (embed) {
            onFatal();
          }
        },
      },
    });

    art.on("video:error", () => {
      if (embed) setUseEmbed(true);
    });

    artRef.current = art;

    return () => {
      if (artRef.current) {
        artRef.current.destroy(false);
        artRef.current = null;
      }
    };
  }, [m3u8, embed, title, poster, useEmbed]);

  if (useEmbed && embed) {
    return <EmbedPlayer url={embed} title={title} />;
  }

  if (!m3u8 && embed) {
    return <EmbedPlayer url={embed} title={title} />;
  }

  if (!m3u8 && !embed) {
    return (
      <div className="h-full w-full grid place-items-center bg-black text-muted-foreground">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Không có nguồn phát.
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full artplayer-app" />;
}

function EmbedPlayer({ url, title }: { url: string; title: string }) {
  const src = withAutoplay(url);

  return (
    <iframe
      key={src}
      src={src}
      title={title}
      className="h-full w-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
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

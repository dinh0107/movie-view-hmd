"use client";

import { useEffect, useRef, useState } from "react";
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
  const [useEmbed, setUseEmbed] = useState(false);
  const embedRef = useRef(embed);
  embedRef.current = embed;

  useEffect(() => {
    setUseEmbed(false);
  }, [m3u8, embed]);

  if (useEmbed && embed) {
    return <EmbedPlayer url={embed} title={title} />;
  }

  if (m3u8 && !useEmbed) {
    return (
      <HlsVideo
        key={m3u8}
        src={m3u8}
        title={title}
        poster={poster}
        onFallback={() => {
          if (embedRef.current) setUseEmbed(true);
        }}
      />
    );
  }

  if (embed) {
    return <EmbedPlayer url={embed} title={title} />;
  }

  return (
    <div className="h-full w-full grid place-items-center bg-black text-muted-foreground">
      <div className="flex items-center gap-2">
        <Play className="h-5 w-5" />
        Không có nguồn phát.
      </div>
    </div>
  );
}

function HlsVideo({
  src,
  title,
  poster,
  onFallback,
}: {
  src: string;
  title: string;
  poster?: string | null;
  onFallback?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const onFallbackRef = useRef(onFallback);
  onFallbackRef.current = onFallback;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onNativeError = () => onFallbackRef.current?.();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("error", onNativeError);
      video.play().catch(() => {});
      return () => {
        video.removeEventListener("error", onNativeError);
        video.removeAttribute("src");
        video.load();
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(src));

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
              onFallbackRef.current?.();
            } else {
              hls.startLoad();
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            onFallbackRef.current?.();
            break;
        }
      });

      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full bg-black outline-none"
      controls
      playsInline
      preload="auto"
      poster={poster || undefined}
      aria-label={title}
    />
  );
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

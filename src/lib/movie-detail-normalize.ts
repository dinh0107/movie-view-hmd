import { normalizeImage } from "@/lib/utils";
import type {
  EpisodeServer,
  MovieDetail,
} from "@/services/apiService";

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === "string") {
    return val
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function safeId(obj: Record<string, unknown>, fallback: string) {
  return String(obj?._id ?? obj?.id ?? obj?.slug ?? fallback);
}

function normalizeEpisodeServer(sv: Record<string, unknown>): EpisodeServer {
  const serverData = sv?.server_data;
  return {
    server_name: String(sv?.server_name ?? sv?.name ?? "Server"),
    server_data: Array.isArray(serverData)
      ? serverData.map((ep) => {
          const item = ep as Record<string, unknown>;
          return {
            name: String(item?.name ?? item?.episode ?? "Tập"),
            filename: (item?.filename as string | null) ?? null,
            link_embed: (item?.link_embed as string | null) ?? null,
            link_m3u8:
              (item?.link_m3u8 as string | null) ??
              (item?.link_m3U8 as string | null) ??
              null,
          };
        })
      : [],
  };
}

/** Chuẩn hóa response `/phim/{slug}` thành MovieDetail. */
export function normalizeMovieDetailBody(
  body: Record<string, unknown>,
  fallbackSlug: string
): MovieDetail | null {
  const movie = (body.movie ?? body.data ?? body) as Record<string, unknown>;
  const name = movie?.name ?? movie?.title;
  if (!name) return null;

  const safeSlug = encodeURIComponent(fallbackSlug.trim());
  const episodesRaw = (body.episodes ?? body.episode) as unknown[];

  return {
    id: safeId(movie, safeSlug),
    name: String(name),
    slug: String(movie.slug ?? fallbackSlug),
    origin_name: movie.origin_name as string | undefined,
    year: Number(movie.year) || undefined,
    time: movie.time as string | undefined,
    quality: movie.quality as string | undefined,
    lang: movie.lang as string | undefined,
    type: movie.type as string | undefined,
    episode_current: String(
      movie.episode_current ?? movie.episode_total ?? ""
    ),
    content: String(movie.content ?? movie.description ?? ""),
    trailer_url:
      (movie.trailer_url as string | null) ??
      (movie.trailer as string | null) ??
      null,
    poster_url: normalizeImage(movie.poster_url as string | undefined),
    thumb_url: normalizeImage(movie.thumb_url as string | undefined),
    rating:
      typeof movie.rating === "number"
        ? movie.rating
        : Number(movie.rating) || null,
    category: (movie.category ?? movie.categories) as MovieDetail["category"],
    country: (movie.country ?? movie.countries) as MovieDetail["country"],
    actor: toStringArray(movie.actor ?? movie.actors),
    director: toStringArray(movie.director ?? movie.directors),
    episodes: Array.isArray(episodesRaw)
      ? episodesRaw.map((sv) =>
          normalizeEpisodeServer(sv as Record<string, unknown>)
        )
      : [],
  };
}

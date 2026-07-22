import "server-only";
import { normalizeMovieDetailBody } from "@/lib/movie-detail-normalize";
import { cleanSeoText, toAbsoluteImage } from "@/lib/seo";
import type { MovieDetail } from "@/services/apiService";

const BASE = process.env.PHIMAPI_BASE ?? "https://phimapi.com";

export type MovieSeoRecord = {
  name: string;
  slug: string;
  content?: string;
  poster_url?: string;
  thumb_url?: string;
  year?: number;
  origin_name?: string;
  quality?: string;
  lang?: string;
  type?: string;
  episode_current?: string;
  category?: Array<{ name: string; slug?: string }>;
  country?: Array<{ name: string; slug?: string }>;
  seoOnPage: Record<string, unknown>;
  episodes?: unknown[];
};

function asTaxonomy(
  val: unknown
): Array<{ name: string; slug?: string }> | undefined {
  if (!Array.isArray(val)) return undefined;
  return val
    .map((item) => {
      const row = item as Record<string, unknown>;
      const name = String(row?.name ?? "");
      if (!name) return null;
      return { name, slug: row?.slug ? String(row.slug) : undefined };
    })
    .filter(Boolean) as Array<{ name: string; slug?: string }>;
}

function parseMovieBody(
  body: Record<string, unknown>,
  fallbackSlug: string
): MovieSeoRecord | null {
  const movie = (body.movie ?? body.data ?? body) as Record<string, unknown>;
  const name = (movie?.name ?? movie?.title) as string | undefined;
  if (!name) return null;

  return {
    name,
    slug: (movie.slug as string | undefined) ?? fallbackSlug,
    content: (movie.content ?? movie.description) as string | undefined,
    poster_url: movie.poster_url as string | undefined,
    thumb_url: movie.thumb_url as string | undefined,
    year: Number(movie.year) || undefined,
    origin_name: movie.origin_name as string | undefined,
    quality: movie.quality as string | undefined,
    lang: movie.lang as string | undefined,
    type: movie.type as string | undefined,
    episode_current: String(
      movie.episode_current ?? movie.episode_total ?? ""
    ),
    category: asTaxonomy(movie.category ?? movie.categories),
    country: asTaxonomy(movie.country ?? movie.countries),
    seoOnPage: (body.seoOnPage ?? {}) as Record<string, unknown>,
    episodes: (body.episodes ?? body.episode) as unknown[] | undefined,
  };
}

/** Fetch phim từ PhimAPI (server-only, có cache). Thử nhiều endpoint. */
/** Fetch chi tiết phim đầy đủ (server-only, có cache) — dùng cho watch SSR. */
export async function fetchMovieDetailServer(
  slug: string,
  revalidate = 600
): Promise<MovieDetail | null> {
  const safe = encodeURIComponent(slug.trim());
  const urls = [
    `${BASE}/phim/${safe}`,
    `${BASE}/v1/api/phim/${safe}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { next: { revalidate } });
      if (!res.ok) continue;
      const body = (await res.json()) as Record<string, unknown>;
      const detail = normalizeMovieDetailBody(body, slug);
      if (detail) return detail;
    } catch {
      // thử endpoint tiếp theo
    }
  }
  return null;
}

export type MovieSeoFetchResult =
  | { status: "ok"; movie: MovieSeoRecord }
  | { status: "not_found" }
  | { status: "error" };

export async function fetchMovieSeoResult(
  slug: string,
  revalidate = 600
): Promise<MovieSeoFetchResult> {
  const safe = encodeURIComponent(slug.trim());
  const urls = [
    `${BASE}/phim/${safe}`,
    `${BASE}/v1/api/phim/${safe}`,
  ];

  let sawNetwork = false;
  let sawNotFound = false;

  for (const url of urls) {
    try {
      const res = await fetch(url, { next: { revalidate } });
      sawNetwork = true;
      if (res.status === 404) {
        sawNotFound = true;
        continue;
      }
      if (!res.ok) continue;
      const body = (await res.json()) as Record<string, unknown>;
      const parsed = parseMovieBody(body, slug);
      if (parsed) return { status: "ok", movie: parsed };
      // API 200 nhưng không có movie → coi như không tồn tại
      sawNotFound = true;
    } catch {
      // thử endpoint tiếp theo
    }
  }

  if (sawNotFound && sawNetwork) return { status: "not_found" };
  return { status: "error" };
}

export async function fetchMovieSeo(
  slug: string,
  revalidate = 600
): Promise<MovieSeoRecord | null> {
  const result = await fetchMovieSeoResult(slug, revalidate);
  return result.status === "ok" ? result.movie : null;
}

export function movieSeoTitle(
  movie: MovieSeoRecord | null,
  slug: string
): string {
  if (!movie) {
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const seo = movie.seoOnPage;
  return (
    (seo.titleHead as string | undefined) ||
    movie.name ||
    "Xem phim online HD"
  );
}

export function movieSeoDescription(
  movie: MovieSeoRecord | null,
  fallbackTitle: string
): string {
  if (!movie) {
    return `Xem phim ${fallbackTitle} online miễn phí, chất lượng HD, cập nhật nhanh.`;
  }
  const seo = movie.seoOnPage;
  const raw =
    (seo.descriptionHead as string | undefined) ||
    movie.content ||
    `Xem phim ${movie.name} online miễn phí, chất lượng HD, cập nhật nhanh.`;
  return (
    cleanSeoText(raw) ||
    `Xem phim ${movie.name} online miễn phí, chất lượng HD, cập nhật nhanh.`
  );
}

export function movieSeoImages(movie: MovieSeoRecord | null): string[] {
  if (!movie) return [];
  const ogImages = ((movie.seoOnPage.og_image as string[] | undefined) ?? [])
    .map((u) => toAbsoluteImage(u)!)
    .filter(Boolean);
  if (ogImages.length) return ogImages.slice(0, 3);
  return [toAbsoluteImage(movie.poster_url), toAbsoluteImage(movie.thumb_url)]
    .filter(Boolean)
    .slice(0, 3) as string[];
}

export function buildMovieJsonLd(
  movie: MovieSeoRecord,
  canonicalUrl: string
): Record<string, unknown> {
  const image = toAbsoluteImage(movie.poster_url || movie.thumb_url);
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.name,
    ...(movie.origin_name ? { alternateName: movie.origin_name } : {}),
    ...(movie.year ? { datePublished: String(movie.year) } : {}),
    description: cleanSeoText(movie.content) || undefined,
    image: image || undefined,
    url: canonicalUrl,
  };
}

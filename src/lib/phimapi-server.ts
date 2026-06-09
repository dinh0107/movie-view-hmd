import "server-only";
import { cleanSeoText, toAbsoluteImage } from "@/lib/seo";

const BASE = process.env.PHIMAPI_BASE ?? "https://phimapi.com";

export type MovieSeoRecord = {
  name: string;
  slug: string;
  content?: string;
  poster_url?: string;
  thumb_url?: string;
  year?: number;
  origin_name?: string;
  seoOnPage: Record<string, unknown>;
  episodes?: unknown[];
};

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
    seoOnPage: (body.seoOnPage ?? {}) as Record<string, unknown>,
    episodes: (body.episodes ?? body.episode) as unknown[] | undefined,
  };
}

/** Fetch phim từ PhimAPI (server-only, có cache). Thử nhiều endpoint. */
export async function fetchMovieSeo(
  slug: string,
  revalidate = 600
): Promise<MovieSeoRecord | null> {
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
      const parsed = parseMovieBody(body, slug);
      if (parsed) return parsed;
    } catch {
      // thử endpoint tiếp theo
    }
  }
  return null;
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

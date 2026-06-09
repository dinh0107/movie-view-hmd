import "server-only";

import type { MovieListResult, ListMovie } from "@/lib/movie-list-types";
import { pickParam, prettySlug, type SearchParams } from "@/lib/seo";
import { normalizeImage, pickBaseKey, sanitizeSlug } from "@/lib/utils";

const BASE = process.env.PHIMAPI_BASE ?? "https://phimapi.com";
const V1 = `${BASE}/v1/api`;

type ListQuery = {
  page: number;
  limit: number;
  country?: string;
  category?: string;
  sort_lang?: string;
  year?: string;
};

function parseSearchParams(sp: SearchParams): ListQuery {
  return {
    page: Number(pickParam(sp, "page") ?? 1) || 1,
    limit: Number(pickParam(sp, "limit") ?? 15) || 15,
    country: pickParam(sp, "country"),
    category: pickParam(sp, "category"),
    sort_lang: pickParam(sp, "sort_lang"),
    year: pickParam(sp, "year"),
  };
}

function buildQuery(q: ListQuery): URLSearchParams {
  const params = new URLSearchParams({
    page: String(q.page),
    limit: String(q.limit),
  });
  if (q.country) params.set("country", q.country);
  if (q.category) params.set("category", q.category);
  if (q.sort_lang) params.set("sort_lang", q.sort_lang);
  if (q.year) params.set("year", q.year);
  return params;
}

function normalizeItem(item: Record<string, unknown>): ListMovie {
  return {
    id: String(item._id ?? item.id ?? item.slug ?? ""),
    name: String(item.name ?? ""),
    slug: String(item.slug ?? ""),
    poster_url: normalizeImage(item.poster_url as string | undefined),
    thumb_url: normalizeImage(item.thumb_url as string | undefined),
    year: Number(item.year) || 0,
    episode_current: String(item.episode_current ?? ""),
  };
}

function parseListPayload(payload: Record<string, unknown>): {
  movies: ListMovie[];
  title: string;
  totalPages: number;
} {
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const rawItems = (data.items ?? payload.items) as unknown[];
  const movies = Array.isArray(rawItems)
    ? rawItems.map((item) =>
        normalizeItem(item as Record<string, unknown>)
      )
    : [];

  const paramsBlock = data.params as Record<string, unknown> | undefined;
  const pagination =
    paramsBlock?.pagination ??
    data.pagination ??
    payload.pagination;

  const totalPages = Number(
    (pagination as { totalPages?: number } | undefined)?.totalPages ?? 1
  );

  const seo = (data.seoOnPage ?? payload.seoOnPage) as
    | Record<string, unknown>
    | undefined;

  const title = String(
    data.titlePage ?? payload.titlePage ?? seo?.titleHead ?? ""
  );

  return {
    movies,
    title,
    totalPages: totalPages > 0 ? totalPages : 1,
  };
}

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchWithFallback(
  urls: string[]
): Promise<Record<string, unknown>> {
  let lastErr: unknown;
  for (const url of urls) {
    try {
      return await fetchJson(url);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export async function fetchCategoryList(
  slug: string,
  searchParams?: SearchParams
): Promise<MovieListResult> {
  const q = parseSearchParams(searchParams ?? {});
  const params = buildQuery(q);
  const fallbackTitle = `Thể loại: ${prettySlug(slug)}`;

  try {
    const payload = await fetchJson(
      `${V1}/the-loai/${encodeURIComponent(slug)}?${params}`
    );
    const parsed = parseListPayload(payload);
    return {
      movies: parsed.movies,
      title: parsed.title || fallbackTitle,
      page: q.page,
      totalPages: parsed.totalPages,
    };
  } catch {
    return {
      movies: [],
      title: fallbackTitle,
      page: q.page,
      totalPages: 1,
    };
  }
}

export async function fetchCountryList(
  slug: string,
  searchParams?: SearchParams
): Promise<MovieListResult> {
  const q = parseSearchParams(searchParams ?? {});
  const params = buildQuery(q);
  const fallbackTitle = `Quốc gia: ${prettySlug(slug)}`;

  try {
    const payload = await fetchJson(
      `${V1}/quoc-gia/${encodeURIComponent(slug)}?${params}`
    );
    const parsed = parseListPayload(payload);
    return {
      movies: parsed.movies,
      title: parsed.title || fallbackTitle,
      page: q.page,
      totalPages: parsed.totalPages,
    };
  } catch {
    return {
      movies: [],
      title: fallbackTitle,
      page: q.page,
      totalPages: 1,
    };
  }
}

const TYPE_SLUG_LABELS: Record<string, string> = {
  "phim-moi-cap-nhat": "Phim mới cập nhật",
  "phim-le": "Phim lẻ",
  "phim-bo": "Phim bộ",
  "hoat-hinh": "Hoạt hình",
  "tv-shows": "TV Shows",
};

export async function fetchTypeList(
  slug: string,
  searchParams?: SearchParams
): Promise<MovieListResult> {
  const cleanSlug = sanitizeSlug(slug);
  const q = parseSearchParams(searchParams ?? {});
  const params = buildQuery(q);
  const fallbackTitle =
    TYPE_SLUG_LABELS[cleanSlug] || prettySlug(cleanSlug);

  const urls =
    pickBaseKey(cleanSlug) === "phim_root"
      ? [`${BASE}/danh-sach/${encodeURIComponent(cleanSlug)}?${params}`]
      : [
          `${V1}/danh-sach/${encodeURIComponent(cleanSlug)}?${params}`,
          `${BASE}/danh-sach/${encodeURIComponent(cleanSlug)}?${params}`,
        ];

  try {
    const payload = await fetchWithFallback(urls);
    const parsed = parseListPayload(payload);
    return {
      movies: parsed.movies,
      title: parsed.title || fallbackTitle,
      page: q.page,
      totalPages: parsed.totalPages,
    };
  } catch {
    return {
      movies: [],
      title: fallbackTitle,
      page: q.page,
      totalPages: 1,
    };
  }
}

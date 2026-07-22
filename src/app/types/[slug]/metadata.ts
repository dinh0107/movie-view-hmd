import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import {
  buildCanonicalPath,
  buildPageMetadata,
  pickParam,
  ROBOTS_NOINDEX_FOLLOW,
  shouldNoindexListPage,
  shouldUseAbsoluteTitle,
  toAbsoluteImage,
  type SearchParams,
} from "@/lib/seo";

const SLUG_MAP: Record<string, string> = {
  "phim-moi-cap-nhat": "Phim mới cập nhật",
  "phim-le": "Phim lẻ",
  "phim-bo": "Phim bộ",
  "hoat-hinh": "Hoạt hình",
  "tv-shows": "TV Shows",
};

const sanitize = (s: string) => {
  const x = (s || "").toLowerCase().replace(/^\/+|\/+$/g, "");
  return x.startsWith("phim-moi-cap-nhat") ? "phim-moi-cap-nhat" : x;
};

const prettyFromSlug = (slug: string) =>
  SLUG_MAP[slug] ||
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

type MetadataProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateTypeMetadata({
  params,
  searchParams,
}: MetadataProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const sp = await searchParams;
  const slug = sanitize(raw);
  const page = Number(pickParam(sp, "page") ?? 1) || 1;
  const isNewest = slug === "phim-moi-cap-nhat";
  const baseKey = isNewest ? "phim_root" : "phim_v1";

  const q = new URLSearchParams({
    page: String(page),
    limit: String(pickParam(sp, "limit") ?? 15),
  });
  const category = pickParam(sp, "category");
  const country = pickParam(sp, "country");
  const sortLang = pickParam(sp, "sort_lang");
  const year = pickParam(sp, "year");
  if (category) q.set("category", category);
  if (country) q.set("country", country);
  if (!isNewest && sortLang) q.set("sort_lang", sortLang);
  if (year) q.set("year", year);

  const canonical = buildCanonicalPath(`/types/${slug}`);
  const pretty = prettyFromSlug(slug);

  let payload: Record<string, unknown> = {};
  try {
    const res = await apiGet<Record<string, unknown>>(
      `/danh-sach/${encodeURIComponent(slug)}?${q.toString()}`,
      { baseKey, fallbackBases: isNewest ? undefined : ["phim_root"] }
    );
    payload = isNewest
      ? (res ?? {})
      : ((res?.data as Record<string, unknown>) ?? {});
  } catch (err) {
    console.error("[types] generateMetadata:", err);
    const title = page > 1 ? `${pretty} - Trang ${page}` : pretty;
    return buildPageMetadata({
      title,
      description: "Xem phim online miễn phí, chất lượng HD, cập nhật nhanh.",
      canonical,
      robots: ROBOTS_NOINDEX_FOLLOW,
    });
  }

  const seo = (payload.seoOnPage ?? {}) as Record<string, unknown>;
  const baseTitle =
    (seo.titleHead as string | undefined) ||
    (payload.titlePage as string | undefined) ||
    pretty;
  const title = page > 1 ? `${baseTitle} - Trang ${page}` : baseTitle;

  const images = ((seo.og_image as string[] | undefined) ?? [])
    .map((u) => toAbsoluteImage(u)!)
    .filter(Boolean)
    .slice(0, 3);

  const titlePage = payload.titlePage as string | undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  const listItems = (payload.items ?? data?.items) as unknown[] | undefined;
  const noItems = !Array.isArray(listItems) || listItems.length === 0;
  const noindex = shouldNoindexListPage({
    page,
    noItems,
    filters: [category, country, sortLang, year],
  });

  return buildPageMetadata({
    title,
    description:
      (seo.descriptionHead as string | undefined) ||
      "Xem phim online miễn phí, chất lượng HD, cập nhật nhanh.",
    canonical,
    images: images.length ? images : undefined,
    absoluteTitle: shouldUseAbsoluteTitle(seo, titlePage),
    robots: noindex ? ROBOTS_NOINDEX_FOLLOW : { index: true, follow: true },
  });
}

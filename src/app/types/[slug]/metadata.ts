import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";

const toAbsolute = (u: string) =>
  /^https?:\/\//i.test(u) ? u : `https://phimimg.com/${u.replace(/^\/+/, "")}`;

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

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
): Promise<Metadata> {
  const { slug: raw } = await props.params;
  const sp = await props.searchParams;

  const pick = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const slug = sanitize(raw);
  const isNewest = slug === "phim-moi-cap-nhat";
  const baseKey = isNewest ? "phim_root" : "phim_v1";

  const q = new URLSearchParams({
    page: String(pick("page") ?? 1),
    limit: String(pick("limit") ?? 15),
  });
  const category = pick("category");
  const country  = pick("country");
  const sortLang = pick("sort_lang");
  const year     = pick("year");

  if (category) q.set("category", category);
  if (country)  q.set("country", country);
  if (!isNewest && sortLang) q.set("sort_lang", sortLang);
  if (year) q.set("year", year);

  const path = `/danh-sach/${encodeURIComponent(slug)}?${q.toString()}`;
  const res = await apiGet<any>(path, {
    baseKey,
    fallbackBases: isNewest ? undefined : ["phim_root"],
  });

  const p = isNewest ? (res ?? {}) : (res?.data ?? {});
  const seo = p?.seoOnPage ?? {};

  const pretty = prettyFromSlug(slug);
  const title =
    seo.titleHead ||
    p?.titlePage ||
    `${pretty}`;

  const description =
    seo.descriptionHead ||
    "Xem phim online miễn phí, chất lượng HD, cập nhật nhanh.";

  const images = (seo.og_image ?? [])
    .map(toAbsolute)
    .filter(Boolean)
    .slice(0, 3); 

  const canonical = `/types/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: seo.og_type || "website",
      url: canonical,
      title,
      description,
      images: images.length ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? images : undefined,
    },
  };
}

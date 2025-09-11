import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";

const SITE_URL = "https://www.phimngay.top";

const toAbsolute = (u: string) =>
  /^https?:\/\//i.test(u) ? u : `https://phimimg.com/${u.replace(/^\/+/, "")}`;

const SLUG_MAP: Record<string, string> = {
  "phim-moi-cap-nhat": "Phim mới cập nhật",
  "phim-le": "Phim lẻ",
  "phim-bo": "Phim bộ",
  "hoat-hinh": "Hoạt hình",
  "tv-shows": "TV Shows",
};

const normalizeSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const prettyFromSlug = (slug: string) =>
  SLUG_MAP[slug] ||
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Sinh metadata chuẩn SEO từ slug + dữ liệu API
 */
function normalizeMeta({
  slug,
  seo,
  p,
}: {
  slug: string;
  seo?: any;
  p?: any;
}): { title: string; description: string; images: string[] } {
  const pretty = prettyFromSlug(slug);
  const year = new Date().getFullYear();

  const title =
    seo?.titleHead ||
    p?.titlePage ||
    `${pretty} Mới Nhất ${year} | Xem ${pretty} Vietsub HD - Phim Ngay`;

  const description =
    seo?.descriptionHead ||
    p?.descriptionPage ||
    `Tuyển chọn ${pretty.toLowerCase()} mới nhất ${year}, vietsub chất lượng HD. Xem ${pretty.toLowerCase()} trọn bộ, cập nhật nhanh chóng trên Phim Ngay.`;

  const images = (seo?.og_image ?? [])
    .map(toAbsolute)
    .filter(Boolean)
    .slice(0, 3);

  return { title, description, images };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const sp = await searchParams;

  const pick = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const isNewest = slug === "phim-moi-cap-nhat";
  const baseKey = isNewest ? "phim_root" : "phim_v1";

  const q = new URLSearchParams({
    page: String(pick("page") ?? 1),
    limit: String(pick("limit") ?? 15),
  });

  if (pick("category")) q.set("category", String(pick("category")));
  if (pick("country")) q.set("country", String(pick("country")));
  if (!isNewest && pick("sort_lang")) q.set("sort_lang", String(pick("sort_lang")));
  if (pick("year")) q.set("year", String(pick("year")));

  const path = `/danh-sach/${encodeURIComponent(slug)}?${q.toString()}`;
  const res = await apiGet<any>(path, {
    baseKey,
    fallbackBases: isNewest ? undefined : ["phim_root"],
  });

  const p = isNewest ? (res ?? {}) : (res?.data ?? {});
  const seo = p?.seoOnPage ?? {};

  const { title, description, images } = normalizeMeta({ slug, seo, p });

  const canonical = `/types/${normalizedSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${canonical}`,
    },
    openGraph: {
      type: seo?.og_type || "website",
      url: `${SITE_URL}${canonical}`,
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

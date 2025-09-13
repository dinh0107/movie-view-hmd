import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import { sanitizeSlug, pickBaseKey } from "@/lib/utils";

const SITE_URL = "https://www.phimngay.top";

const SLUG_MAP: Record<string, string> = {
  "phim-moi-cap-nhat": "Phim mới cập nhật",
  "phim-le": "Phim lẻ",
  "phim-bo": "Phim bộ",
  "hoat-hinh": "Phim Hoạt hình",
  "tv-shows": "TV Shows",
};

const toPretty = (s: string) =>
  (s || "").replace(/^\/+|\/+$/g, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const safe = (v?: string) => (typeof v === "string" ? v.trim() : "");
const orBlank = (v?: string) => safe(v) || "";
const toAbsolute = (u?: string) =>
  u && /^https?:\/\//i.test(u) ? u : u ? `https://phimimg.com/${u.replace(/^\/+/, "")}` : "";

export async function generateMetadata(args: any): Promise<Metadata> {
  // chuẩn hoá: hoạt động cho cả Promise và non-Promise
  const { slug } = await args.params;
  const sp = (await args.searchParams) || {};

  const pick = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const cleanSlug = sanitizeSlug ? sanitizeSlug(slug) : slug;
  const baseKey = pickBaseKey?.(cleanSlug) ?? (cleanSlug === "phim-moi-cap-nhat" ? "phim_root" : "phim_v1");

  const q = new URLSearchParams({
    page: String(pick("page") ?? 1),
    limit: String(pick("limit") ?? 15),
  });
  if (pick("category")) q.set("category", String(pick("category")));
  if (pick("country")) q.set("country", String(pick("country")));
  if (cleanSlug !== "phim-moi-cap-nhat" && pick("sort_lang")) q.set("sort_lang", String(pick("sort_lang")));
  if (pick("year")) q.set("year", String(pick("year")));

  const canonical = `/types/${cleanSlug}`;
  const apiPath = `/danh-sach/${encodeURIComponent(cleanSlug)}?${q.toString()}`;

  let p: any = {};
  let seo: any = {};
  try {
    const res = await apiGet<any>(apiPath, {
      baseKey,
      fallbackBases: baseKey === "phim_v1" ? ["phim_root"] : undefined,
    });
    p = baseKey === "phim_root" ? res ?? {} : res?.data ?? {};
    seo = p?.seoOnPage ?? {};
  } catch {}

  const year = new Date().getFullYear();
  const displayTitle =
    orBlank(p?.titlePage) || SLUG_MAP[cleanSlug] || toPretty(cleanSlug) || "Danh sách phim";

  const title =
    orBlank(seo?.titleHead) ||
    `${displayTitle} Mới Nhất ${year} | Xem ${displayTitle} Vietsub HD - Phim Ngay`;

  const description =
    orBlank(seo?.descriptionHead) ||
    orBlank(p?.descriptionPage) ||
    `Tuyển chọn ${displayTitle.toLowerCase()} mới nhất ${year}, vietsub chất lượng HD. Xem ${displayTitle.toLowerCase()} trọn bộ, cập nhật nhanh chóng trên Phim Ngay.`;

  const rawImages = Array.isArray(seo?.og_image) ? seo.og_image : [];
  const images = rawImages.map(toAbsolute).filter(Boolean).slice(0, 3);

  return {
    title: title || "Phim Ngay – Xem phim Vietsub HD",
    description,
    alternates: { canonical: `${SITE_URL}${canonical}` },
    openGraph: {
      type: (seo?.og_type && String(seo.og_type)) || "website",
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
    robots: { index: true, follow: true },
  };
}

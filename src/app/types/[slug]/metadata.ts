import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";

const SITE_URL = "https://www.phimngay.top";

const SLUG_MAP: Record<string, string> = {
  "phim-moi-cap-nhat": "Phim mới cập nhật",
  "phim-le": "Phim lẻ",
  "phim-bo": "Phim bộ",
  "hoat-hinh": "Hoạt hình",
  "tv-shows": "TV Shows",
};

const toPretty = (s: string) =>
  (s || "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const toAbsolute = (u?: string) =>
  u && /^https?:\/\//i.test(u)
    ? u
    : u
    ? `https://phimimg.com/${u.replace(/^\/+/, "")}`
    : undefined;

export async function generateMetadata(
  { params, searchParams }: any
): Promise<Metadata> {
  const slug = params?.slug as string;
  const sp = (searchParams ?? {}) as Record<string, string | string[] | undefined>;
  const pretty = SLUG_MAP[slug] || toPretty(slug);
  const year = new Date().getFullYear();

  const pick = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const qp = new URLSearchParams();
  const category = pick("category");
  const country = pick("country");
  const y = pick("year");
  if (category) qp.set("category", String(category));
  if (country) qp.set("country", String(country));
  if (y) qp.set("year", String(y));

  const qs = qp.toString();
  const canonical = `${SITE_URL}/types/${encodeURIComponent(slug)}${qs ? `?${qs}` : ""}`;

  let title = `${pretty} mới nhất ${year} | Xem ${pretty} Vietsub HD - Phim Ngay`;
  let description = `Tuyển chọn ${pretty.toLowerCase()} mới nhất ${year}, vietsub chất lượng HD. Xem trọn bộ, cập nhật nhanh chóng trên Phim Ngay.`;
  let images: string[] | undefined;

  try {
    const apiUrl = `/danh-sach/${encodeURIComponent(slug)}${qs ? `?${qs}` : ""}`;
    const res = await apiGet<any>(apiUrl, {
      baseKey: slug === "phim-moi-cap-nhat" ? "phim_root" : "phim_v1",
      fallbackBases: slug === "phim-moi-cap-nhat" ? undefined : ["phim_root"],
    });

    const data = slug === "phim-moi-cap-nhat" ? res ?? {} : res?.data ?? {};
    const seo = data?.seoOnPage ?? {};

    if (seo.titleHead) title = seo.titleHead;
    if (seo.descriptionHead) description = seo.descriptionHead;

    if (Array.isArray(seo.og_image)) {
      images = seo.og_image
        .map(toAbsolute)
        .filter(Boolean)
        .slice(0, 3) as string[];
    }
  } catch (err) {
    console.error("types metadata error:", err);
  }

  return {
    title: title || "Phim Ngay – Xem phim Vietsub HD",
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
    robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  };
}

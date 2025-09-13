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
  { params }: any
): Promise<Metadata> {
  const slug = params?.slug as string;
  const pretty = SLUG_MAP[slug] || toPretty(slug);
  const year = new Date().getFullYear();

  // fallback mặc định
  let title = `${pretty} mới nhất ${year} | Xem ${pretty} Vietsub HD - Phim Ngay`;
  let description = `Tuyển chọn ${pretty.toLowerCase()} mới nhất ${year}, vietsub chất lượng HD. Xem trọn bộ, cập nhật nhanh chóng trên Phim Ngay.`;
  let images: string[] | undefined;

  try {
    const res = await apiGet<any>(`/danh-sach/${encodeURIComponent(slug)}`, {
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
    console.error("metadata error:", err);
  }

  const canonical = `${SITE_URL}/types/${slug}`;

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
    robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
  };
}

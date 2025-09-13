import type { Metadata } from "next";

const SITE_NAME = "PhimNgay";
const ORIGIN = "https://www.phimngay.top";

const MAP: Record<string, string> = {
  "phim-moi-cap-nhat": "Phim mới cập nhật",
  "phim-le": "Phim lẻ",
  "phim-bo": "Phim bộ",
  "hoat-hinh": "Phim Hoạt hình",
  "tv-shows": "TV Shows",
};

const pretty = (s: string) =>
  (s || "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;               
  const t = MAP[slug] ?? (slug ? pretty(slug) : "Danh sách phim");
  const url = `${ORIGIN}/types/${slug || ""}`;

  return {
    title: `${t} | ${SITE_NAME}`,
    description: `Xem ${t} mới nhất, tốc độ nhanh, miễn phí trên ${SITE_NAME}.`,
    metadataBase: new URL(ORIGIN),
    alternates: { canonical: url },
    openGraph: {
      title: `${t} | ${SITE_NAME}`,
      description: `Thưởng thức ${t} online, cập nhật mỗi ngày.`,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t} | ${SITE_NAME}`,
      description: `Xem ${t} trên ${SITE_NAME}.`,
    },
  };
}

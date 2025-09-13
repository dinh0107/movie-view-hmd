import type { Metadata } from "next";

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

// ảnh OG/Twitter mặc định nếu API không trả về
const DEFAULT_OG = "/og/6199290559244388322.jpg";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const normalized = (slug || "").trim().toLowerCase();
  const t = MAP[normalized] ?? (normalized ? pretty(normalized) : "Danh sách phim");

  // Để Next.js tự render canonical tuyệt đối từ metadataBase
  const canonicalPath = `/types/${normalized}`;

  const desc = `Xem ${t} mới nhất, tốc độ nhanh, miễn phí.`;
  const ogDesc = `Thưởng thức ${t} online, cập nhật mỗi ngày.`;

  return {
    metadataBase: new URL(ORIGIN),

    // <title> + <meta name="description">
    title: t,
    description: desc,

    // <link rel="canonical">
    alternates: { canonical: canonicalPath },

    // <meta name="robots">
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },

    // <meta name="keywords"> (tùy chọn nhưng mình thêm cho đủ bộ)
    keywords: [t, "xem phim online", "phim HD", "phim mới", "xem phim miễn phí"],

    // Open Graph
    openGraph: {
      type: "website",
      url: canonicalPath, // với metadataBase → xuất ra absolute
      title: t,
      description: ogDesc,
      siteName: "Phim ngay",
      locale: "vi_VN",
      images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: t }],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: t,
      description: `Xem ${t} trên Phim ngay.`,
      images: [DEFAULT_OG],
    },

    // (tuỳ chọn) publisher/app name
    applicationName: "Phim ngay",
  };
}

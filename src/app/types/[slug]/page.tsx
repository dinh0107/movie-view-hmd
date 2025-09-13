import TypesClient from "./TypesClient";
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

const DEFAULT_OG = "/og/6199290559244388322.jpg";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const normalized = (slug || "").trim().toLowerCase();
  const readable = normalized ? pretty(normalized) : "Danh sách phim";
  const t = MAP[normalized] ?? readable;

  const canonicalPath = normalized ? `/types/${normalized}` : `/types`;

  const desc = `Xem ${t} mới nhất, tốc độ nhanh, miễn phí.`;
  const ogDesc = `Thưởng thức ${t} online, cập nhật mỗi ngày.`;

  return {
    metadataBase: new URL(ORIGIN),

    title: { absolute: t },
    description: desc,

    alternates: { canonical: canonicalPath },

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

    keywords: [t, "xem phim online", "phim HD", "phim mới", "xem phim miễn phí"],

    openGraph: {
      type: "website",
      url: canonicalPath,    
      title: t,
      description: ogDesc,
      siteName: "Phim ngay",
      locale: "vi_VN",
      images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: t }],
    },

    twitter: {
      card: "summary_large_image",
      title: t,
      description: `Xem ${t} trên Phim ngay.`,
      images: [DEFAULT_OG],
    },

    applicationName: "Phim ngay",
  };
}

export default function Page() {
  return <TypesClient />;
}

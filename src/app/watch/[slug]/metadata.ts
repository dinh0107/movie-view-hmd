// app/watch/[slug]/metadata.ts (hoặc trong page.tsx của route này)
import type { Metadata } from "next";

const ORIGIN = "https://www.phimngay.top";
const pretty = (s: string) =>
  (s || "").replace(/^\/+|\/+$/g, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const normalizeSlug = (s: string) =>
  (s || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const norm = normalizeSlug(slug);
  const t = norm ? `Xem ${pretty(norm)}` : "Xem phim";
  const canonicalPath = `/watch/${norm}`;

  return {
    metadataBase: new URL(ORIGIN),
    title: t,
    description: `${t} chất lượng cao, tốc độ nhanh.`,
    alternates: { canonical: canonicalPath }, 
    robots: { index: true, follow: true },
    openGraph: {
      title: t,
      description: `Xem ${t} online.`,
      url: canonicalPath, 
      type: "video.other",
      siteName: "Phim ngay",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: `Xem ${t} trên Phim ngay.`,
    },
  };
}

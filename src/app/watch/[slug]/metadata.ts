import type { Metadata } from "next";

const ORIGIN = "https://www.phimngay.top";
const pretty = (s: string) =>
  (s || "").replace(/^\/+|\/+$/g, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const t = slug ? `Xem ${pretty(slug)}` : "Xem phim";
  const url = `${ORIGIN}/watch/${slug || ""}`;

  return {
    title: t, 
    description: `${t} chất lượng cao, tốc độ nhanh.`,
    metadataBase: new URL(ORIGIN),
    alternates: { canonical: url },
    openGraph: { title: t, description: `Xem ${t} online.`, url, type: "video.other", siteName: "Phim ngay" },
    twitter: { card: "summary_large_image", title: t, description: `Xem ${t} trên Phim ngay.` },
  };
}

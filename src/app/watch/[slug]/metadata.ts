import type { Metadata } from "next";

const SITE_NAME = "PhimNgay";
const ORIGIN = "https://www.phimngay.top";

const pretty = (s: string) =>
  (s || "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;               
  const t = slug ? `Xem ${pretty(slug)}` : "Xem phim";
  const url = `${ORIGIN}/watch/${slug || ""}`;

  return {
    title: `${t} | ${SITE_NAME}`,
    description: `${t} chất lượng cao, tốc độ nhanh trên ${SITE_NAME}.`,
    metadataBase: new URL(ORIGIN),
    alternates: { canonical: url },
    openGraph: { title: `${t} | ${SITE_NAME}`, description: `Xem ${t} online.`, url, type: "video.other", siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title: `${t} | ${SITE_NAME}`, description: `Xem ${t} trên ${SITE_NAME}.` },
  };
}

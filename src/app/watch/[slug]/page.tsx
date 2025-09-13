import { apiGet } from "@/services/axiosClient";
import WatchPage from "./WatchClient";
import type { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = 3600; 

const ORIGIN = "https://www.phimngay.top";

const normalizeSlug = (s: string) =>
  (s || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");

const pretty = (s: string) =>
  (s || "").replace(/^\/+|\/+$/g, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const toAbsolute = (u?: string) =>
  u && /^https?:\/\//i.test(u) ? u : u ? `https://phimimg.com/${u.replace(/^\/+/, "")}` : undefined;

const stripHtml = (html?: string) =>
  (html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const norm = normalizeSlug(slug);
  const canonicalPath = `/watch/${norm}`;

  let payload: any = {};
  let errored = false;
  try {
    const res = await apiGet<any>(`/phim/${encodeURIComponent(slug)}`, { baseKey: "phim_root" });
    payload = res?.data ?? res ?? {};
  } catch {
    errored = true;
  }

  const seo = payload?.seoOnPage ?? {};
  const mv = payload?.movie ?? payload ?? {};
  const movieName = mv?.name?.trim?.() || pretty(norm);
  const episode =
    mv?.episode_current?.trim?.() || mv?.current_episode?.trim?.() || mv?.e?.toString?.() || "";
  const episodeLabel = episode ? ` ${episode}` : "";

  const title = seo?.titleHead?.trim?.()
    || `Xem ${movieName}`;

  const description =
    seo?.descriptionHead?.trim?.()
    || stripHtml(mv?.content)
    || `Xem ${movieName}${episodeLabel} online miễn phí, chất lượng HD, cập nhật nhanh.`;

  const candidates = [
    mv?.thumb_url,
    mv?.poster_url,
    mv?.image,
    payload?.og_image,
  ].flat?.() ?? [mv?.thumb_url, mv?.poster_url];
  const images = (candidates || [])
    .map(toAbsolute)
    .filter(Boolean)
    .slice(0, 3) as string[] | undefined;

  return {
    metadataBase: new URL(ORIGIN),
    title,
    description,
    alternates: { canonical: canonicalPath },

    robots: errored
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : {
          index: true, follow: true,
          googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
        },

    openGraph: {
      type: "video.other",
      url: canonicalPath,     
      title,                  
      description,
      images,                 
      siteName: "Phim ngay",
      locale: "vi_VN",
    },

    twitter: {
      card: "summary_large_image",
      title,                  
      description,
      images,
    },
  };
}

export default function Page() {
  return <WatchPage />;
}

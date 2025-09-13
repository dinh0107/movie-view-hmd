import type { Metadata } from "next";
import { movieDetailService } from "@/services/apiService";
import { normalizeImage } from "@/lib/utils";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.phimngay.top").replace(/\/+$/, "");

const clean = (s?: string) =>
  (s || "").toString().trim().toLowerCase().replace(/^\/+|\/+$/g, "");

const absImg = (u?: string) => {
  const x = normalizeImage?.(u || "") || (u || "");
  return /^https?:\/\//i.test(x) ? x : x ? `https://phimimg.com/${x.replace(/^\/+/, "")}` : "";
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;                
  const cleanSlug = clean(slug);
  const canonical = `${SITE_URL}/watch/${cleanSlug}`; 

  let detail: any = null;
  try {
    detail = await movieDetailService.getMovieDetail(cleanSlug);
  } catch {
  }

  const movieName: string = detail?.name || detail?.title || cleanSlug.replace(/-/g, " ");
  const year: string | undefined = detail?.year ? String(detail.year) : undefined;

  const posters = [
    absImg(detail?.poster_url),
    absImg(detail?.thumb_url),
    absImg(detail?.image),
  ].filter(Boolean);
  const images = posters.slice(0, 3);

  const title =
    detail?.seoTitle ||
    `Xem ${movieName}${year ? " (" + year + ")" : ""} | Vietsub HD - Phim Ngay`;

  const description =
    detail?.description?.toString().trim() ||
    detail?.content?.toString().trim() ||
    `Xem ${movieName} trực tuyến, Vietsub HD, tốc độ nhanh. Cập nhật tập mới liên tục trên Phim Ngay.`;

  return {
    title,
    description,

    alternates: { canonical },

    openGraph: {
      type: "video.other",
      url: canonical,
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

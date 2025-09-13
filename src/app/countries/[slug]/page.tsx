import MoviesPage from "./CountruyClient";
export const dynamic = "force-static";

export const revalidate = 3600; 
import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import { normalizeSlug } from "@/lib/utils";

const ORIGIN = "https://www.phimngay.top";
const DEFAULT_OG = "/og/6199290559244388322.jpg";

const toAbsolute = (u?: string) =>
  u && /^https?:\/\//i.test(u) ? u : u ? `https://phimimg.com/${u.replace(/^\/+/, "")}` : "";

const prettyFromSlug = (s: string) =>
  (s || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;

  const normalizedSlug = normalizeSlug(slug);

  const pick = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const page = Number(pick("page") ?? 1) || 1;
  const limit = Number(pick("limit") ?? 15) || 15;

  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  const country = pick("country");
  const sortLang = pick("sort_lang");
  const year = pick("year");
  if (country) q.set("country", country);
  if (sortLang) q.set("sort_lang", sortLang);
  if (year) q.set("year", year);

  const path = `/quoc-gia/${encodeURIComponent(slug)}?${q.toString()}`;

  let data: any = {};
  let errored = false;
  try {
    const res = await apiGet<any>(path, { baseKey: "phim_v1" });
    data = res?.data ?? {};
  } catch {
    errored = true;
  }

  const seo = data?.seoOnPage ?? {};
  const pretty = prettyFromSlug(normalizedSlug);

  const baseTitle = seo.titleHead?.trim?.() || data?.titlePage?.trim?.() || `Quốc gia: ${pretty}`;
  const title = page > 1 ? `${baseTitle} - Trang ${page}` : baseTitle;

  const description =
    seo.descriptionHead?.trim?.() ||
    `Xem phim ${pretty} online miễn phí, chất lượng HD, cập nhật nhanh.`;

  const ogImages: string[] = Array.isArray(seo?.og_image)
    ? (seo.og_image as string[]).map(toAbsolute).filter(Boolean)
    : [];

  let cover: string | undefined;
  if (!ogImages.length && Array.isArray(data?.items) && data.items.length > 0) {
    const first = data.items[0];
    cover = toAbsolute(first?.poster_url) || toAbsolute(first?.thumb_url);
  }

  const imagesArr = (ogImages.length ? ogImages : cover ? [cover] : [DEFAULT_OG]).slice(0, 3);
  const ogImageObjects = imagesArr.map((url) => ({ url }));

  const canonicalPath =
    page > 1 ? `/countries/${normalizedSlug}?page=${page}` : `/countries/${normalizedSlug}`;

  const noItems = !Array.isArray(data?.items) || data.items.length === 0;

  return {
    metadataBase: new URL(ORIGIN),

    title: { absolute: title },
    description,

    alternates: { canonical: canonicalPath },

    robots:
      noItems || errored
        ? {
            index: false,
            follow: true,
            googleBot: { index: false, follow: true },
          }
        : {
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

    keywords: [pretty, "quốc gia", "xem phim online", "phim HD", "phim mới"],

    openGraph: {
      type: seo.og_type || "website",
      url: canonicalPath, 
      siteName: "Phim ngay",
      locale: "vi_VN",
      title,
      description,
      images: ogImageObjects,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imagesArr,
    },
  };
}


export default function Page() {
  return <MoviesPage />;
}

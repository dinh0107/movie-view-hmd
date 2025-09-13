// app/categories/[slug]/page.tsx
import MoviesPage from "./CategoriesClient";
import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import { normalizeSlug } from "@/lib/utils";

export const revalidate = 3600;         

const ORIGIN = "https://www.phimngay.top";
const toAbs = (u?: string) =>
  u && /^https?:\/\//i.test(u) ? u : u ? `https://phimimg.com/${u.replace(/^\/+/, "")}` : "";
const pretty = (s: string) =>
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
  const normalized = normalizeSlug(slug);

  const pick = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = new URLSearchParams({
    page: String(pick("page") ?? 1),
    limit: String(pick("limit") ?? 15),
  });
  if (pick("country")) q.set("country", pick("country")!);
  if (pick("sort_lang")) q.set("sort_lang", pick("sort_lang")!);
  if (pick("year")) q.set("year", pick("year")!);

  let data: any = {}, seo: any = {};
  try {
    const res = await apiGet<any>(`/the-loai/${encodeURIComponent(slug)}?${q.toString()}`, { baseKey: "phim_v1" });
    data = res?.data ?? {};
    seo = data?.seoOnPage ?? {};
  } catch {}

  const t =
    seo?.titleHead?.trim?.() ||
    data?.titlePage?.trim?.() ||
    pretty(normalized) ||
    "Danh sách phim";

  const desc =
    seo?.descriptionHead?.trim?.() ||
    `Xem phim ${pretty(normalized) || "hay"} online miễn phí, chất lượng HD, cập nhật nhanh.`;

  const ogImages: string[] = Array.isArray(seo?.og_image)
    ? seo.og_image.map(toAbs).filter(Boolean)
    : [];

  let cover: string | undefined;
  if (!ogImages.length && Array.isArray(data?.items) && data.items.length) {
    cover = toAbs(data.items[0]?.poster_url) || toAbs(data.items[0]?.thumb_url);
  }
  const images = ogImages.length ? ogImages.slice(0, 3) : cover ? [cover] : undefined;

  const canonicalPath = `/categories/${normalized}`;   
  const url = `${ORIGIN}${canonicalPath}`;

  return {
    metadataBase: new URL(ORIGIN),

    title: t,
    description: desc,

    alternates: { canonical: url },

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

    openGraph: {
      type: "website",
      url: canonicalPath,
      title: t,
      description: desc,
      images,
      siteName: "Phim ngay",
      locale: "vi_VN",
    },

    twitter: {
      card: "summary_large_image",
      title: t,
      description: desc,
      images,
    },
  };
}

export default function Page() {
  return <MoviesPage />;
}

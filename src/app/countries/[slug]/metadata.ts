import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";

const toAbsolute = (u: string) =>
  /^https?:\/\//i.test(u)
    ? u
    : `https://phimimg.com/${u?.replace(/^\/+/, "")}`;

const prettyFromSlug = (s: string) =>
  (s || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;

  const pick = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const page = Number(pick("page") ?? 1) || 1;
  const limit = Number(pick("limit") ?? 15) || 15;

  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const country  = pick("country");    
  const sortLang = pick("sort_lang");
  const year     = pick("year");

  if (country)  q.set("country", country);
  if (sortLang) q.set("sort_lang", sortLang);
  if (year)     q.set("year", year);

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
  const pretty = prettyFromSlug(slug);

  const baseTitle = seo.titleHead || data?.titlePage || `Quốc gia: ${pretty}`;
  const title = page > 1 ? `${baseTitle} - Trang ${page}` : baseTitle;

  const description =
    seo.descriptionHead ||
    `Xem phim ${pretty} online miễn phí, chất lượng HD, cập nhật nhanh.`;

  const ogImages = (seo.og_image ?? [])
    .map(toAbsolute)
    .filter(Boolean)
    .slice(0, 3);

  let cover: string | undefined;
  if (ogImages.length === 0 && Array.isArray(data?.items) && data.items.length > 0) {
    const first = data.items[0];
    if (first?.poster_url) cover = toAbsolute(first.poster_url);
    else if (first?.thumb_url) cover = toAbsolute(first.thumb_url);
  }
  const images = ogImages.length ? ogImages : cover ? [cover] : undefined;

  const canonical = page > 1 ? `/quoc-gia/${slug}?page=${page}` : `/quoc-gia/${slug}`;

  const noItems = !Array.isArray(data?.items) || data.items.length === 0;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noItems || errored
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true },
    openGraph: {
      type: seo.og_type || "website",
      url: canonical,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import { normalizeSlug } from "@/lib/utils";

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
  const normalizedSlug = normalizeSlug(slug)
  const sp = await searchParams;

  const pick = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };
  console.log("canonical:", normalizedSlug)
  console.log("sp:", sp)

  const q = new URLSearchParams({
    page: String(pick("page") ?? 1),
    limit: String(pick("limit") ?? 15),
  });
  if (pick("country")) q.set("country", pick("country")!);
  if (pick("sort_lang")) q.set("sort_lang", pick("sort_lang")!);
  if (pick("year")) q.set("year", pick("year")!);

  const path = `/the-loai/${encodeURIComponent(slug)}?${q.toString()}`;
  const res = await apiGet<any>(path, { baseKey: "phim_v1" });

  const data = res?.data ?? {};
  const seo = data?.seoOnPage ?? {};

  const pretty = prettyFromSlug(normalizedSlug);
  const title =
    seo.titleHead ||
    data?.titlePage ||
    `${pretty}`;

  const description =
    seo.descriptionHead ||
    `Xem phim ${pretty} online miễn phí, chất lượng HD, cập nhật nhanh.`;

  const ogImages = (seo.og_image ?? [])
    .map(toAbsolute)
    .filter(Boolean);

  let cover: string | undefined;
  if (ogImages.length === 0 && data?.items?.length > 0) {
    const first = data.items[0];
    if (first?.poster_url) cover = toAbsolute(first.poster_url);
    else if (first?.thumb_url) cover = toAbsolute(first.thumb_url);
  }

  const images = ogImages.length > 0 ? ogImages.slice(0, 3) : cover ? [cover] : undefined;

  const canonical = `/categories/${normalizedSlug}`;
  console.log("canonical:", canonical)
  return {
    title,
    description,
    alternates: { canonical },
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

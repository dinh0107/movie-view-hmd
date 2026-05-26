import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import {
  buildCanonicalPath,
  buildPageMetadata,
  pickParam,
  prettySlug,
  shouldUseAbsoluteTitle,
  toAbsoluteImage,
  type SearchParams,
} from "@/lib/seo";

type MetadataProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateCategoryMetadata({
  params,
  searchParams,
}: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(pickParam(sp, "page") ?? 1) || 1;

  const q = new URLSearchParams({
    page: String(page),
    limit: String(pickParam(sp, "limit") ?? 15),
  });
  const country = pickParam(sp, "country");
  const sortLang = pickParam(sp, "sort_lang");
  const year = pickParam(sp, "year");
  if (country) q.set("country", country);
  if (sortLang) q.set("sort_lang", sortLang);
  if (year) q.set("year", year);

  const canonical = buildCanonicalPath(`/categories/${slug}`, { page });
  const pretty = prettySlug(slug);

  let data: Record<string, unknown> = {};
  try {
    const res = await apiGet<{ data?: Record<string, unknown> }>(
      `/the-loai/${encodeURIComponent(slug)}?${q.toString()}`,
      { baseKey: "phim_v1" }
    );
    data = res?.data ?? {};
  } catch (err) {
    console.error("[categories] generateMetadata:", err);
    const title =
      page > 1 ? `Thể loại: ${pretty} - Trang ${page}` : `Thể loại: ${pretty}`;
    return buildPageMetadata({
      title,
      description: `Xem phim ${pretty} online miễn phí, chất lượng HD, cập nhật nhanh.`,
      canonical,
    });
  }

  const seo = (data.seoOnPage ?? {}) as Record<string, unknown>;
  const baseTitle =
    (seo.titleHead as string | undefined) ||
    (data.titlePage as string | undefined) ||
    `Thể loại: ${pretty}`;
  const title = page > 1 ? `${baseTitle} - Trang ${page}` : baseTitle;

  const ogImages = ((seo.og_image as string[] | undefined) ?? [])
    .map((u) => toAbsoluteImage(u)!)
    .filter(Boolean);

  const items = data.items as Array<Record<string, string>> | undefined;
  let cover: string | undefined;
  if (!ogImages.length && items?.length) {
    const first = items[0];
    cover =
      toAbsoluteImage(first.poster_url) || toAbsoluteImage(first.thumb_url);
  }

  const images =
    ogImages.length > 0 ? ogImages.slice(0, 3) : cover ? [cover] : undefined;

  const titlePage = data.titlePage as string | undefined;
  const noItems = !items?.length;

  return buildPageMetadata({
    title,
    description:
      (seo.descriptionHead as string | undefined) ||
      `Xem phim ${pretty} online miễn phí, chất lượng HD, cập nhật nhanh.`,
    canonical,
    images,
    absoluteTitle: shouldUseAbsoluteTitle(seo, titlePage),
    robots: noItems
      ? {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        }
      : { index: true, follow: true },
  });
}

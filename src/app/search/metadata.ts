import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import {
  buildCanonicalPath,
  buildPageMetadata,
  pickParam,
  shouldUseAbsoluteTitle,
  toAbsoluteImage,
  type SearchParams,
} from "@/lib/seo";

type MetadataProps = {
  searchParams: Promise<SearchParams>;
};

export async function generateSearchMetadata({
  searchParams,
}: MetadataProps): Promise<Metadata> {
  const sp = await searchParams;
  const query = pickParam(sp, "query");

  const canonical = buildCanonicalPath("/search", {
    query: query ? { query } : undefined,
  });

  if (!query) {
    return buildPageMetadata({
      title: "Tìm kiếm phim miễn phí",
      description:
        "Tìm kiếm và xem phim online miễn phí, chất lượng HD, cập nhật nhanh.",
      canonical: "/search",
      robots: {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      },
    });
  }

  let data: Record<string, unknown> | null = null;
  try {
    const res = await apiGet<{ data?: Record<string, unknown> }>(
      `/tim-kiem?keyword=${encodeURIComponent(query)}`,
      { baseKey: "phim_v1" }
    );
    data = res?.data ?? {};
  } catch (err) {
    console.error("[search] generateMetadata:", err);
  }

  const seo = (data?.seoOnPage ?? {}) as Record<string, unknown>;
  const title =
    (seo.titleHead as string | undefined) ||
    `Kết quả tìm kiếm cho: ${query}`;
  const description =
    (seo.descriptionHead as string | undefined) ||
    `Xem kết quả tìm kiếm cho "${query}" online miễn phí, chất lượng HD, cập nhật nhanh.`;

  const ogImages = ((seo.og_image as string[] | undefined) ?? [])
    .map((u) => toAbsoluteImage(u)!)
    .filter(Boolean);

  const items = data?.items as Array<Record<string, string>> | undefined;
  let cover: string | undefined;
  if (!ogImages.length && items?.length) {
    const first = items[0];
    cover =
      toAbsoluteImage(first.poster_url) || toAbsoluteImage(first.thumb_url);
  }

  const images =
    ogImages.length > 0 ? ogImages.slice(0, 3) : cover ? [cover] : undefined;

  return buildPageMetadata({
    title,
    description,
    canonical,
    images,
    absoluteTitle: shouldUseAbsoluteTitle(seo),
  });
}

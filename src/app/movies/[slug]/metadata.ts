import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import { buildPageMetadata, cleanSeoText, toAbsoluteImage } from "@/lib/seo";

type MetadataProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMovieMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `/movies/${slug}`;

  let payload: Record<string, unknown> = {};
  let errored = false;

  try {
    const res = await apiGet<Record<string, unknown>>(
      `/phim/${encodeURIComponent(slug)}`,
      { baseKey: "phim_root" }
    );
    payload = (res?.data as Record<string, unknown>) ?? res ?? {};
  } catch {
    errored = true;
  }

  const seo = (payload.seoOnPage ?? {}) as Record<string, unknown>;
  const mv = (payload.movie ?? payload) as Record<string, unknown>;

  const title =
    (seo.titleHead as string | undefined) ||
    (mv?.name as string | undefined) ||
    "Xem phim online HD";

  const rawDescription =
    (seo.descriptionHead as string | undefined) ||
    (mv?.content as string | undefined) ||
    "Xem phim online miễn phí, chất lượng HD, cập nhật nhanh.";
  const description =
    cleanSeoText(rawDescription) ||
    "Xem phim online miễn phí, chất lượng HD, cập nhật nhanh.";

  const ogImages = ((seo.og_image as string[] | undefined) ?? [])
    .map((u) => toAbsoluteImage(u)!)
    .filter(Boolean);

  const poster = toAbsoluteImage(mv?.poster_url as string | undefined);
  const thumb = toAbsoluteImage(mv?.thumb_url as string | undefined);
  const images = (
    ogImages.length ? ogImages : [poster, thumb].filter(Boolean)
  ).slice(0, 3) as string[];

  const noindex = errored || !mv?.name;

  return buildPageMetadata({
    title,
    description,
    canonical,
    images: images.length ? images : undefined,
    absoluteTitle: true,
    openGraphType: "video.movie",
    robots: noindex
      ? {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        }
      : { index: true, follow: true },
  });
}

import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import {
  buildPageMetadata,
  cleanSeoText,
  pickParam,
  toAbsoluteImage,
  type SearchParams,
} from "@/lib/seo";

type MetadataProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

function episodeLabel(ep: string | undefined): string {
  if (ep === undefined || ep === "") return "";
  const n = Number(ep);
  if (Number.isNaN(n)) return ` - Tập ${ep}`;
  return ` - Tập ${n + 1}`;
}

export async function generateWatchMetadata({
  params,
  searchParams,
}: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const ep = pickParam(sp, "ep");
  const epSuffix = episodeLabel(ep);

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
  const movieName = (mv?.name as string | undefined) || "phim";

  const title = seo.titleHead
    ? `${seo.titleHead as string}${epSuffix}`
    : `Xem phim ${movieName}${epSuffix}`;

  const rawDescription =
    (seo.descriptionHead as string | undefined) ||
    (mv?.content as string | undefined) ||
    `Xem phim ${movieName} online miễn phí, chất lượng cao.`;

  const description =
    cleanSeoText(rawDescription) ||
    `Xem phim ${movieName} online miễn phí, chất lượng cao.`;

  const ogImages = ((seo.og_image as string[] | undefined) ?? [])
    .map((u) => toAbsoluteImage(u)!)
    .filter(Boolean);

  const poster = toAbsoluteImage(mv?.poster_url as string | undefined);
  const thumb = toAbsoluteImage(mv?.thumb_url as string | undefined);
  const images = (
    ogImages.length ? ogImages : [poster, thumb].filter(Boolean)
  ).slice(0, 3) as string[];

  const canonical =
    ep !== undefined && ep !== "" && ep !== "0"
      ? `/watch/${slug}?ep=${encodeURIComponent(ep)}`
      : `/watch/${slug}`;

  return buildPageMetadata({
    title,
    description,
    canonical,
    images: images.length ? images : undefined,
    absoluteTitle: true,
    openGraphType: "video.episode",
    robots: errored
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
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  });
}

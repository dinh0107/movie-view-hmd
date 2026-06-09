import type { Metadata } from "next";
import {
  fetchMovieSeo,
  movieSeoDescription,
  movieSeoImages,
  movieSeoTitle,
} from "@/lib/phimapi-server";
import {
  buildPageMetadata,
  pickParam,
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

  const movie = await fetchMovieSeo(slug);
  const baseTitle = movieSeoTitle(movie, slug);
  const title = `${baseTitle}${epSuffix}`;

  const canonical =
    ep !== undefined && ep !== "" && ep !== "0"
      ? `/watch/${slug}?ep=${encodeURIComponent(ep)}`
      : `/watch/${slug}`;

  return buildPageMetadata({
    title,
    description: movieSeoDescription(movie, baseTitle),
    canonical,
    images: movieSeoImages(movie).length ? movieSeoImages(movie) : undefined,
    absoluteTitle: true,
    openGraphType: "video.episode",
    robots: {
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

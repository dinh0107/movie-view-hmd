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
  ROBOTS_NOINDEX_FOLLOW,
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

  // Trang xem là phụ: noindex + canonical về trang chi tiết phim
  return buildPageMetadata({
    title,
    description: movieSeoDescription(movie, baseTitle),
    canonical: `/movies/${slug}`,
    images: movieSeoImages(movie).length ? movieSeoImages(movie) : undefined,
    absoluteTitle: true,
    openGraphType: "video.episode",
    robots: ROBOTS_NOINDEX_FOLLOW,
  });
}

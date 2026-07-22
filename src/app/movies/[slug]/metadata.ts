import type { Metadata } from "next";
import {
  fetchMovieSeoResult,
  movieSeoDescription,
  movieSeoImages,
  movieSeoTitle,
} from "@/lib/phimapi-server";
import { buildPageMetadata, ROBOTS_NOINDEX_FOLLOW } from "@/lib/seo";

type MetadataProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMovieMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `/movies/${slug}`;
  const result = await fetchMovieSeoResult(slug);
  const movie = result.status === "ok" ? result.movie : null;
  const title = movieSeoTitle(movie, slug);

  // Chỉ noindex khi chắc chắn không có phim — lỗi API tạm vẫn giữ index
  if (result.status === "not_found") {
    return buildPageMetadata({
      title,
      description: movieSeoDescription(null, title),
      canonical,
      absoluteTitle: true,
      openGraphType: "video.movie",
      robots: ROBOTS_NOINDEX_FOLLOW,
    });
  }

  return buildPageMetadata({
    title,
    description: movieSeoDescription(movie, title),
    canonical,
    images: movieSeoImages(movie).length ? movieSeoImages(movie) : undefined,
    absoluteTitle: true,
    openGraphType: "video.movie",
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

import type { Metadata } from "next";
import {
  fetchMovieSeo,
  movieSeoDescription,
  movieSeoImages,
  movieSeoTitle,
} from "@/lib/phimapi-server";
import { buildPageMetadata } from "@/lib/seo";

type MetadataProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMovieMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `/movies/${slug}`;
  const movie = await fetchMovieSeo(slug);
  const title = movieSeoTitle(movie, slug);

  return buildPageMetadata({
    title,
    description: movieSeoDescription(movie, title),
    canonical,
    images: movieSeoImages(movie).length ? movieSeoImages(movie) : undefined,
    absoluteTitle: true,
    openGraphType: "video.movie",
  });
}

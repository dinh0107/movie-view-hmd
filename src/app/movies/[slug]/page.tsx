import MovieDetailPage from "./MovieClient";
import { generateMovieMetadata } from "./metadata";
import { MovieJsonLd } from "@/components/seo/MovieJsonLd";
import { fetchMovieSeo } from "@/lib/phimapi-server";
import { cleanSeoText } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata(
  props: Parameters<typeof generateMovieMetadata>[0]
) {
  return generateMovieMetadata(props);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const movie = await fetchMovieSeo(slug);

  return (
    <>
      {movie ? <MovieJsonLd movie={movie} path={`/movies/${slug}`} /> : null}
      {movie ? (
        <article className="sr-only" aria-hidden="true">
          <h1>{movie.name}</h1>
          {movie.year ? <p>Năm: {movie.year}</p> : null}
          {movie.content ? (
            <p>{cleanSeoText(movie.content)}</p>
          ) : null}
        </article>
      ) : null}
      <MovieDetailPage slug={slug} />
    </>
  );
}

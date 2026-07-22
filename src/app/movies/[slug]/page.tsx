import { notFound } from "next/navigation";
import MovieDetailPage from "./MovieClient";
import { generateMovieMetadata } from "./metadata";
import { MovieJsonLd } from "@/components/seo/MovieJsonLd";
import { fetchMovieSeoResult } from "@/lib/phimapi-server";
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
  const result = await fetchMovieSeoResult(slug);

  // 404 thật → Google bỏ index đúng cách (tránh soft-404 rồi mất index)
  if (result.status === "not_found") {
    notFound();
  }

  const movie = result.status === "ok" ? result.movie : null;
  const categories = movie?.category ?? [];
  const countries = movie?.country ?? [];

  return (
    <>
      {movie ? <MovieJsonLd movie={movie} path={`/movies/${slug}`} /> : null}
      {movie ? (
        <article className="sr-only">
          <h1>
            {movie.name}
            {movie.year ? ` (${movie.year})` : ""}
          </h1>
          {movie.origin_name ? <p>Tên gốc: {movie.origin_name}</p> : null}
          {movie.quality || movie.lang || movie.episode_current ? (
            <p>
              {[movie.quality, movie.lang, movie.episode_current]
                .filter(Boolean)
                .join(" • ")}
            </p>
          ) : null}
          {movie.content ? <p>{cleanSeoText(movie.content)}</p> : null}
          {categories.length > 0 ? (
            <p>
              Thể loại:{" "}
              {categories.map((c, i) => (
                <span key={c.slug ?? c.name}>
                  {i > 0 ? ", " : ""}
                  {c.slug ? (
                    <a href={`/categories/${c.slug}`}>{c.name}</a>
                  ) : (
                    c.name
                  )}
                </span>
              ))}
            </p>
          ) : null}
          {countries.length > 0 ? (
            <p>
              Quốc gia:{" "}
              {countries.map((c, i) => (
                <span key={c.slug ?? c.name}>
                  {i > 0 ? ", " : ""}
                  {c.slug ? (
                    <a href={`/countries/${c.slug}`}>{c.name}</a>
                  ) : (
                    c.name
                  )}
                </span>
              ))}
            </p>
          ) : null}
          <p>
            <a href={`/watch/${slug}`}>Xem phim {movie.name} online</a>
          </p>
        </article>
      ) : null}
      <MovieDetailPage slug={slug} />
    </>
  );
}

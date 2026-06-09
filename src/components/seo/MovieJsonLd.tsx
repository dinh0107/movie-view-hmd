import { buildMovieJsonLd, type MovieSeoRecord } from "@/lib/phimapi-server";
import { SITE_URL } from "@/lib/site";

export function MovieJsonLd({
  movie,
  path,
}: {
  movie: MovieSeoRecord;
  path: string;
}) {
  const canonical = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const jsonLd = buildMovieJsonLd(movie, canonical);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

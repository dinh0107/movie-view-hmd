import type { ListMovie } from "@/lib/movie-list-types";
import { SITE_URL } from "@/lib/site";
import { toAbsoluteUrl } from "@/lib/seo";

export function MovieListSeo({
  title,
  movies,
  canonicalPath,
}: {
  title: string;
  movies: ListMovie[];
  canonicalPath: string;
}) {
  if (!movies.length) return null;

  const canonical = toAbsoluteUrl(canonicalPath, SITE_URL);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    url: canonical,
    numberOfItems: movies.length,
    itemListElement: movies.map((movie, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/movies/${movie.slug}`,
      name: movie.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="sr-only" aria-label={title}>
        <h1>{title}</h1>
        <ul>
          {movies.map((movie) => (
            <li key={movie.slug}>
              <a href={`/movies/${movie.slug}`}>{movie.name}</a>
              {movie.year ? ` (${movie.year})` : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

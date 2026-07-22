import { getNewest } from "@/lib/map";
import { SITE_URL } from "@/lib/site";

type HomeMovie = { slug: string; name: string; year?: number };

function extractMovies(payload: unknown): HomeMovie[] {
  const p = payload as Record<string, unknown>;
  const data = p?.data as Record<string, unknown> | undefined;
  const items = (p?.items ?? data?.items) as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item.slug && item.name)
    .map((item) => ({
      slug: String(item.slug),
      name: String(item.name),
      year: Number(item.year) || undefined,
    }));
}

/** SSR cho trang chủ: h1 + link phim mới (Google đọc được ngay). */
export async function HomeSeo() {
  let movies: HomeMovie[] = [];
  try {
    const payload = await getNewest(1);
    movies = extractMovies(payload).slice(0, 36);
  } catch {
    movies = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Phim mới cập nhật",
    url: SITE_URL,
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
      <section className="sr-only" aria-label="Phim mới cập nhật">
        <h1>Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh</h1>
        <p>
          Xem phim online miễn phí, chất lượng HD. Kho phim hành động, tình cảm,
          hoạt hình cập nhật nhanh.
        </p>
        {movies.length > 0 ? (
          <>
            <h2>Phim mới cập nhật</h2>
            <ul>
              {movies.map((movie) => (
                <li key={movie.slug}>
                  <a href={`/movies/${movie.slug}`}>
                    {movie.name}
                    {movie.year ? ` (${movie.year})` : ""}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <nav>
          <a href="/types/phim-moi-cap-nhat">Phim mới</a>
          <a href="/types/phim-bo">Phim bộ</a>
          <a href="/types/phim-le">Phim lẻ</a>
          <a href="/types/hoat-hinh">Hoạt hình</a>
          <a href="/types/tv-shows">TV Shows</a>
        </nav>
      </section>
    </>
  );
}

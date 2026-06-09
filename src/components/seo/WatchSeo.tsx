import type { MovieDetail } from "@/services/apiService";
import { cleanSeoText, toAbsoluteImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type WatchSeoProps = {
  detail: MovieDetail;
  slug: string;
  epIdx?: number;
  serverIdx?: number;
};

export function WatchSeo({
  detail,
  slug,
  epIdx = 0,
  serverIdx = 0,
}: WatchSeoProps) {
  const episodes = detail.episodes?.[serverIdx]?.server_data ?? [];
  const currentEp = episodes[epIdx];
  const epLabel = currentEp?.name ?? `Tập ${epIdx + 1}`;
  const watchUrl = `${SITE_URL}/watch/${slug}`;
  const movieUrl = `${SITE_URL}/movies/${slug}`;
  const thumbnail = toAbsoluteImage(detail.poster_url || detail.thumb_url);
  const description = cleanSeoText(detail.content);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${detail.name} - ${epLabel}`,
    description: description || undefined,
    thumbnailUrl: thumbnail || undefined,
    url: watchUrl,
    contentUrl: watchUrl,
    ...(detail.year ? { uploadDate: `${detail.year}-01-01` } : {}),
    partOfSeries: {
      "@type": "Movie",
      name: detail.name,
      url: movieUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="sr-only" aria-label={`Xem phim ${detail.name}`}>
        <h1>
          Xem phim {detail.name} - {epLabel}
        </h1>
        {description ? <p>{description}</p> : null}
        <p>
          <a href={`/movies/${slug}`}>Thông tin phim {detail.name}</a>
        </p>
        {episodes.length > 0 ? (
          <>
            <h2>Danh sách tập</h2>
            <ul>
              {episodes.map((ep, index) => (
                <li key={`${ep.name}-${index}`}>
                  <a href={`/watch/${slug}?ep=${index}`}>
                    {ep.name ?? `Tập ${index + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </article>
    </>
  );
}

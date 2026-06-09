import type { MetadataRoute } from "next";
import { getSitemapMovies, getSitemapTotalPages } from "@/lib/map";
import { SITE_URL } from "@/lib/site";
import { fetchCategory, fetchCountries } from "@/services/hederService";

export const revalidate = 3600;

const TYPE_SLUGS = [
  "phim-moi-cap-nhat",
  "phim-bo",
  "phim-le",
  "hoat-hinh",
  "tv-shows",
];

const MAX_MOVIE_PAGES = 200;

export async function generateSitemaps() {
  const totalPages = Math.min(
    (await getSitemapTotalPages().catch(() => 1)) ?? 1,
    MAX_MOVIE_PAGES
  );
  const movieSitemapCount = Math.max(1, Math.ceil(totalPages / 10));
  return [
    { id: 0 },
    ...Array.from({ length: movieSitemapCount }, (_, i) => ({ id: i + 1 })),
  ];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  if (id === 0) {
    const staticItems: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/`,
        changeFrequency: "daily",
        priority: 1,
        lastModified: now,
      },
    ];

    const typeItems: MetadataRoute.Sitemap = TYPE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/types/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.85,
      lastModified: now,
    }));

    const [categories, countries] = await Promise.all([
      fetchCategory().catch(() => []),
      fetchCountries().catch(() => []),
    ]);

    const categoryItems: MetadataRoute.Sitemap = categories
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITE_URL}/categories/${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
        lastModified: now,
      }));

    const countryItems: MetadataRoute.Sitemap = countries
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITE_URL}/countries/${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
        lastModified: now,
      }));

    return [...staticItems, ...typeItems, ...categoryItems, ...countryItems];
  }

  const batchIndex = id - 1;
  const startPage = batchIndex * 10 + 1;
  const endPage = startPage + 9;

  const movies = await getSitemapMovies(endPage, startPage).catch(() => []);

  return (Array.isArray(movies) ? movies : []).map((m) => ({
    url: `${SITE_URL}/movies/${m.slug}`,
    lastModified: m.updatedAt ? new Date(m.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

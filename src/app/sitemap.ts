import type { MetadataRoute } from "next";
import { getSitemapMovies } from "@/lib/map";
import { SITE_URL } from "@/lib/site";
import { fetchCategory, fetchCountries } from "@/services/hederService";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

const TYPE_SLUGS = [
  "phim-moi-cap-nhat",
  "phim-bo",
  "phim-le",
  "hoat-hinh",
  "tv-shows",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticItems: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/search`,
      changeFrequency: "weekly",
      priority: 0.5,
      lastModified: now,
    },
  ];

  const typeItems: MetadataRoute.Sitemap = TYPE_SLUGS.map((slug) => ({
    url: `${SITE_URL}/types/${slug}`,
    changeFrequency: "daily" as const,
    priority: 0.85,
    lastModified: now,
  }));

  const [categories, countries, movies] = await Promise.all([
    fetchCategory(),
    fetchCountries(),
    getSitemapMovies(20).catch(() => []),
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

  const movieItems: MetadataRoute.Sitemap = (
    Array.isArray(movies) ? movies : []
  ).map((m) => ({
    url: `${SITE_URL}/movies/${m.slug}`,
    lastModified: m.updatedAt ? new Date(m.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticItems,
    ...typeItems,
    ...categoryItems,
    ...countryItems,
    ...movieItems,
  ];
}

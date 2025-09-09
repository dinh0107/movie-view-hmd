import type { MetadataRoute } from "next";
import { getAllMovies } from "@/lib/utils";

export const revalidate = 3600; 
export const dynamic = "force-static"; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://phimngay.top";
  const staticItems: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${siteUrl}/bang-xep-hang`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: new Date(),
    },
  ];

  try {
    const movies = await getAllMovies();

    if (!Array.isArray(movies) || movies.length === 0) {
      return staticItems;
    }

    const dynamicItems: MetadataRoute.Sitemap = movies.map((m) => ({
      url: `${siteUrl}/movies/${m.slug}`,
      lastModified: m.updatedAt ? new Date(m.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticItems, ...dynamicItems];
  } catch (err) {
    console.error("Sitemap fetch error:", err);
    return staticItems; 
  }
}

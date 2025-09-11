import { getNewest, getCategories, getCountries } from "@/lib/map";
import type { MetadataRoute } from "next";

export const revalidate = 3600;
export const dynamic = "force-static";

function toListArray(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  return (
    (payload as any)?.items ??
    (payload as any)?.results ??
    (payload as any)?.data ??
    []
  );
}

interface MovieItem {
  slug: string;
  modified?: { time: string };
  updatedAt?: string;
}

interface Taxonomy {
  slug: string;
  updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phimngay.top";
  const now = new Date();
  const MAX_PAGE = Number(process.env.SITEMAP_MAX_PAGE ?? 10);

  const items: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site}/types/phim-bo`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site}/types/phim-le`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site}/types/hoat-hinh`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
  ];

  /** ================== CATEGORIES ================== */
  try {
    const cats = toListArray(await getCategories()) as Taxonomy[];
    items.push(
      ...cats.map((c) => ({
        url: `${site}/categories/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );
  } catch (e) {
    console.error("sitemap categories error:", e);
  }

  /** ================== COUNTRIES ================== */
  try {
    const countries = toListArray(await getCountries()) as Taxonomy[];
    items.push(
      ...countries.map((c) => ({
        url: `${site}/countries/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
    );
  } catch (e) {
    console.error("sitemap countries error:", e);
  }

  /** ================== MOVIES ================== */
  for (let page = 1; page <= MAX_PAGE; page++) {
    try {
      const data = await getNewest(page);
      const list: MovieItem[] = toListArray(data);
      if (!list.length) break;

      items.push(
        ...list.map((m) => {
          const lastModifiedStr = m.modified?.time ?? m.updatedAt;
          const lastModified = lastModifiedStr ? new Date(lastModifiedStr) : now;

          const age = now.getTime() - lastModified.getTime();
          const priority = age < 1000 * 60 * 60 * 24 * 30 ? 0.8 : 0.5;

          return {
            url: `${site}/watch/${m.slug}`,
            lastModified,
            changeFrequency: "weekly" as const,
            priority,
          };
        })
      );

      if (list.length < 20) break;
    } catch (e) {
      console.error("sitemap movies error:", e);
      break;
    }
  }

  return items;
}

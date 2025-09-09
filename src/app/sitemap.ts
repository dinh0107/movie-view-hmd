import { getNewest } from "@/lib/map";
import type { MetadataRoute } from "next";

export const revalidate = 3600;
export const dynamic = "force-static";

function toListArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  return payload?.items ?? payload?.results ?? payload?.data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://phimngay.top";
  const now = new Date();
  const items: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site}/types/phim-moi-cap-nhat`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
  ];

  for (let page = 1; page <= 10; page++) {
    try {
      const data = await getNewest(page);
      const list = toListArray(data);
      if (!list.length) break;

      items.push(
        ...list.map((m: any) => ({
          url: `${site}/watch/${m.slug}`,
          lastModified:
            m.modified?.time ? new Date(m.modified.time) :
            m.updatedAt      ? new Date(m.updatedAt)      :
            now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
      );

      if (list.length < 20) break; 
    } catch (e) {
      console.error("sitemap phimapi error:", e);
      break;
    }
  }
  return items;
}

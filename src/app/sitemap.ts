// app/sitemap.ts
import { getNewest, getCategories, getCountries } from "@/lib/map";
import type { MetadataRoute } from "next";

export const revalidate = 3600;
export const dynamic = "force-static";

function toListArray(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  return (payload as any)?.items ?? (payload as any)?.results ?? (payload as any)?.data ?? [];
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

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.phimngay.top").replace(/\/+$/, "");
const MAX_PAGE = Number(process.env.SITEMAP_MAX_PAGE ?? 10);

const cleanSlug = (s?: string) =>
  (s || "").toString().trim().toLowerCase().replace(/^\/+|\/+$/g, "");

const join = (path: string) =>
  `${SITE}/${path.replace(/^\/+/, "").replace(/\/{2,}/g, "/")}`.replace(/\/$/, "");

// canonical dạng PATH
const canonList = () => join("/types/phim-moi-cap-nhat");
const canonType = (slug: string) => join(`/types/${cleanSlug(slug)}`);
const canonCategory = (slug: string) => join(`/categories/${cleanSlug(slug)}`);
const canonCountry = (slug: string) => join(`/countries/${cleanSlug(slug)}`);
const canonYear = (y: string) => join(`/years/${cleanSlug(y)}`);
const canonMovie = (slug: string) => join(`/watch/${cleanSlug(slug)}`);

const tidy = (u: string) => u.replace(/\/$/, "").replace(/\?$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const seen = new Set<string>();
  const push = (arr: MetadataRoute.Sitemap, item: MetadataRoute.Sitemap[number]) => {
    const normalized = { ...item, url: tidy(item.url) };
    if (!seen.has(normalized.url)) {
      seen.add(normalized.url);
      arr.push(normalized);
    }
  };

  const items: MetadataRoute.Sitemap = [];

  // Home
  push(items, { url: SITE, lastModified: now, changeFrequency: "daily", priority: 1 });

  // List page tổng hợp
  push(items, {
    url: canonList(),
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  });

  // 3 loại chính
  push(items, {
    url: canonType("phim-bo"),
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  });
  push(items, {
    url: canonType("phim-le"),
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  });
  push(items, {
    url: canonType("hoat-hinh"),
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  });

  // Categories
  try {
    const cats = toListArray(await getCategories()) as Taxonomy[];
    for (const c of cats) {
      push(items, {
        url: canonCategory(c.slug),
        lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error("sitemap categories error:", e);
  }

  // Countries
  try {
    const countries = toListArray(await getCountries()) as Taxonomy[];
    for (const c of countries) {
      push(items, {
        url: canonCountry(c.slug),
        lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error("sitemap countries error:", e);
  }

  // Movies
  for (let page = 1; page <= MAX_PAGE; page++) {
    try {
      const list: MovieItem[] = toListArray(await getNewest(page));
      if (!list.length) break;

      for (const m of list) {
        const url = canonMovie(m.slug);
        const lastModifiedStr = m.modified?.time ?? m.updatedAt;
        const lastModified = lastModifiedStr ? new Date(lastModifiedStr) : now;

        const age = now.getTime() - lastModified.getTime();
        const priority = age < 1000 * 60 * 60 * 24 * 30 ? 0.8 : 0.5;

        push(items, { url, lastModified, changeFrequency: "weekly", priority });
      }
      if (list.length < 20) break;
    } catch (e) {
      console.error("sitemap movies error:", e);
      break;
    }
  }

  return items;
}

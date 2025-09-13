// app/sitemap.ts
import { getNewest, getCategories, getCountries } from "@/lib/map";
import type { MetadataRoute } from "next";

export const revalidate = 3600;
export const dynamic = "force-static";

// ---------------- helpers ----------------
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

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.phimngay.top")
  .replace(/\/+$/, "");

const MAX_PAGE = Number(process.env.SITEMAP_MAX_PAGE ?? 10);

const cleanSlug = (s?: string) =>
  (s || "").toString().trim().toLowerCase().replace(/^\/+|\/+$/g, "");

const join = (path: string) =>
  `${SITE}/${path.replace(/^\/+/, "").replace(/\/{2,}/g, "/")}`;

const WHITELIST = new Set(["category", "country", "year"]);

const withQS = (path: string, qs: Record<string, string | undefined>) => {
  const base = join(path).replace(/\/$/, "");
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(qs)) {
    if (!WHITELIST.has(k)) continue;
    if (typeof v === "string") {
      const val = v.trim();
      if (val) params.set(k, val.toLowerCase());
    }
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

const canonListBase = "/types/phim-moi-cap-nhat";
const canonCategory = (slug: string) =>
  withQS(canonListBase, { category: cleanSlug(slug) });
const canonCountry = (slug: string) =>
  withQS(canonListBase, { country: cleanSlug(slug) });
const canonMovie = (slug: string) => join(`/watch/${cleanSlug(slug)}`);

const tidy = (u: string) => u.replace(/\/$/, "").replace(/\?$/, "");

// ---------------- sitemap ----------------
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const seen = new Set<string>();

  const push = (
    arr: MetadataRoute.Sitemap,
    item: MetadataRoute.Sitemap[number]
  ) => {
    const normalized = { ...item, url: tidy(item.url) };
    const key = normalized.url;
    if (!seen.has(key)) {
      seen.add(key);
      arr.push(normalized);
    }
  };

  const items: MetadataRoute.Sitemap = [];

  push(items, {
    url: join("/"),
    lastModified: now,
    changeFrequency: "daily",
    priority: 1,
  });
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

  // countries -> canonical dạng query
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

  // newest movies -> canonical /watch/[slug]
  for (let page = 1; page <= MAX_PAGE; page++) {
    try {
      const data = await getNewest(page);
      const list: MovieItem[] = toListArray(data);
      if (!list.length) break;

      for (const m of list) {
        const url = canonMovie(m.slug);
        const lastModifiedStr = m.modified?.time ?? m.updatedAt;
        const lastModified = lastModifiedStr ? new Date(lastModifiedStr) : now;

        const age = now.getTime() - lastModified.getTime();
        const priority = age < 1000 * 60 * 60 * 24 * 30 ? 0.8 : 0.5;

        push(items, {
          url,
          lastModified,
          changeFrequency: "weekly",
          priority,
        });
      }
      if (list.length < 20) break; 
    } catch (e) {
      console.error("sitemap movies error:", e);
      break;
    }
  }

  return items;
}

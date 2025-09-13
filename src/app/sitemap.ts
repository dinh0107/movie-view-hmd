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

const SITE =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://www.phimngay.top").replace(
    /\/+$/,
    ""
  );

const MAX_PAGE = Number(process.env.SITEMAP_MAX_PAGE ?? 10);

// --- helpers: canonical hoá URL ---
const cleanSlug = (s?: string) =>
  (s || "").toString().trim().toLowerCase().replace(/^\/+|\/+$/g, "");

const join = (path: string) =>
  `${SITE}/${path.replace(/^\/+/, "").replace(/\/{2,}/g, "/")}`;

const withQS = (path: string, qs: Record<string, string | undefined>) => {
  const u = new URL(join(path));
  Object.entries(qs).forEach(([k, v]) => {
    if (typeof v === "string" && v.trim() !== "") u.searchParams.set(k, v);
  });
  return u.toString();
};

// QUY ƯỚC CANONICAL:
// - Trang danh mục/thể loại/quốc gia: dùng 1 listing canonical duy nhất
//   `/types/phim-moi-cap-nhat` + query tương ứng.
// - KHÔNG đưa page=1, limit mặc định… vào sitemap.
const canonListBase = "/types/phim-moi-cap-nhat";
const canonCategory = (slug: string) =>
  withQS(canonListBase, { category: cleanSlug(slug) });
const canonCountry = (slug: string) =>
  withQS(canonListBase, { country: cleanSlug(slug) });

// Trang phim: canonical là `/watch/[slug]` (không thêm ep mặc định ở sitemap).
const canonMovie = (slug: string) => join(`/watch/${cleanSlug(slug)}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Dùng Set để tránh trùng URL
  const seen = new Set<string>();
  const push = (
    arr: MetadataRoute.Sitemap,
    item: MetadataRoute.Sitemap[number]
  ) => {
    const key = item.url.replace(/\/$/, "");
    if (!seen.has(key)) {
      seen.add(key);
      arr.push(item);
    }
  };

  const items: MetadataRoute.Sitemap = [];

  // --- Trang tĩnh/cố định (đảm bảo là canonical thật sự) ---
  push(items, {
    url: join("/"),
    lastModified: now,
    changeFrequency: "daily",
    priority: 1,
  });

  // Các loại chính nên dùng đúng route canonical của bạn:
  // (Nếu 3 URL dưới TRÙNG với canonical bạn render trong metadata thì giữ;
  //  nếu không, hãy bỏ hoặc thay bằng route canonical tương ứng.)
  push(items, {
    url: join("/types/phim-bo"),
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  });
  push(items, {
    url: join("/types/phim-le"),
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  });
  push(items, {
    url: join("/types/hoat-hinh"),
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  });

  // ================== CATEGORIES (dùng canonical) ==================
  try {
    const cats = toListArray(await getCategories()) as Taxonomy[];
    for (const c of cats) {
      const url = canonCategory(c.slug);
      push(items, {
        url,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error("sitemap categories error:", e);
  }

  // ================== COUNTRIES (dùng canonical) ==================
  try {
    const countries = toListArray(await getCountries()) as Taxonomy[];
    for (const c of countries) {
      const url = canonCountry(c.slug);
      push(items, {
        url,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (e) {
    console.error("sitemap countries error:", e);
  }

  // ================== MOVIES (dùng canonical) ==================
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

import "server-only";

const BASE = process.env.PHIMAPI_BASE ?? "https://phimapi.com";

export type PhimapiItem = {
  slug?: string;
  name?: string;
  origin_name?: string;
  year?: number;
  modified?: { time?: string };
  updatedAt?: string;
  id?: string | number;
};

async function getJSON<T>(url: string, revalidate = 3600): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

export async function getNewest(page = 1) {
  try {
    return await getJSON<any>(`${BASE}/danh-sach/phim-moi-cap-nhat-v3?page=${page}`);
  } catch {
    try {
      return await getJSON<any>(`${BASE}/danh-sach/phim-moi-cap-nhat-v2?page=${page}`);
    } catch {
      return await getJSON<any>(`${BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`);
    }
  }
}

export async function getMovieDetail(slug: string) {
  return getJSON<any>(`${BASE}/phim/${encodeURIComponent(slug)}`, 600);
}

export async function listByType(params: {
  type_list: "phim-bo" | "phim-le" | "tv-shows" | "hoat-hinh" | string;
  page?: number;
  sort_field?: "_id" | "modified.time" | "year";
  sort_type?: "asc" | "desc";
  sort_lang?: "vietsub" | "thuyet-minh" | "long-tieng";
  category?: string; 
  country?: string;  
  year?: number;
  limit?: number;   
}) {
  const {
    type_list, page = 1, sort_field = "modified.time",
    sort_type = "desc", sort_lang, category, country, year, limit = 20,
  } = params;

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("sort_field", sort_field);
  qs.set("sort_type", sort_type);
  if (sort_lang) qs.set("sort_lang", sort_lang);
  if (category) qs.set("category", category);
  if (country) qs.set("country", country);
  if (year) qs.set("year", String(year));
  if (limit) qs.set("limit", String(limit));

  const url = `${BASE}/v1/api/danh-sach/${encodeURIComponent(type_list)}?${qs}`;
  return getJSON<any>(url);
}

export const getCategories = () => getJSON<any>(`${BASE}/the-loai`, 86400);
export const getCountries  = () => getJSON<any>(`${BASE}/quoc-gia`, 86400);

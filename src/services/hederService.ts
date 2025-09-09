import { li } from "framer-motion/client";
import { apiGet } from "./axiosClient";

export interface Prop {
  id: string;
  name: string;
  slug?: string;
}

function normalizeList(data: any): any[] {
  return data?.data?.items ?? data?.data ?? data ?? [];
}

function mapItem(x: any): Prop {
  return {
    id: x._id ?? x.id ?? x.slug,
    name: x.name,
    slug: x.slug,
  };
}

async function fetchData(endpoint: string): Promise<Prop[]> {
  try {
    const data = await apiGet<any>(endpoint);
    const list = normalizeList(data);
    return Array.isArray(list) ? list.map(mapItem) : [];
  } catch (err) {
    console.error(`fetchData error [${endpoint}]:`, err);
    return [];
  }
}

export const fetchCategory = () => fetchData("/the-loai");
export const fetchCountries = () => fetchData("/quoc-gia");

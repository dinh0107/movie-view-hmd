import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export type Movie = {
  slug: string;
  updatedAt: string;
};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function normalizeImage(url?: string | null) {
  if (!url) return "/no-image.jpg";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const path = url.replace(/^\/+/, "");
  const full = `https://phimimg.com/${path}`;
  return full;
}


function extractIframeSrc(html: string): string | null {
  if (!html) return null;
  const m = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function toYouTubeEmbed(url: string): string | null {
  const watch = url.match(/youtube\.com\/watch\?v=([^&]+)/i);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;

  const short = url.match(/youtu\.be\/([^?]+)/i);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;

  if (/youtube\.com\/embed\//i.test(url)) return url;

  return null;
}

function withAutoplay(u: string, extra: Record<string, string | number> = {}) {
  try {
    const url = new URL(u);
    url.searchParams.set('autoplay', '1');
    if (url.hostname.includes('youtube.com')) url.searchParams.set('rel', '0');
    Object.entries(extra).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    return url.toString();
  } catch {
    return u + (u.includes('?') ? '&' : '?') + 'autoplay=1';
  }
}

export function normalizeTrailer(input?: string | null): string | null {
  if (!input) return null;

  const trimmed = input.trim();

  if (trimmed.startsWith('<')) {
    const src = extractIframeSrc(trimmed);
    return src ? withAutoplay(src) : null;
  }

  const yt = toYouTubeEmbed(trimmed);
  if (yt) return withAutoplay(yt);

  return withAutoplay(trimmed);
}




export function fixApiPath(path: string) {
  const p = `/${path}`.replace(/\/+/g, "/");
  if (p.startsWith("/v1/api/")) return p;
  const NEED_PREFIX = [/^\/danh-sach\//i, /^\/the-loai(\/|$)/i, /^\/quoc-gia(\/|$)/i, /^\/tim-kiem(\/|$)/i];
  if (NEED_PREFIX.some((re) => re.test(p))) {
    return `/v1/api${p}`;
  }
  return p;
}


export async function getAllMovies(): Promise<Movie[]> {
  const origin =
    process.env.API_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  try {
    const res = await fetch(`${origin}/api/movies?limit=5000`, {
      next: { revalidate: 3600 }, 
    });

    if (!res.ok) {
      throw new Error(`Fetch movies failed: ${res.status}`);
    }

    return (await res.json()) as Movie[];
  } catch (err) {
    console.error("getAllMovies error:", err);
    return [];
  }
}


export const sanitizeSlug = (slug: string) => {
  if (slug === "phim-moi-cap-nhat" || slug.startsWith("phim-moi-cap-nhat")) {
    return "phim-moi-cap-nhat"; 
  }
  return slug;
};

export const pickBaseKey = (slug: string) => {
  return slug === "phim-moi-cap-nhat" ? "phim_root" : "phim_v1";
};



export function getListTitle(slug: string, categoryTitle?: string) {
  if (categoryTitle) return `Danh sách: ${categoryTitle}`;

  const slugMap: Record<string, string> = {
    "phim-moi-cap-nhat": "Phim mới cập nhật",
    "phim-le": "Phim lẻ",
    "phim-bo": "Phim bộ",
    "hoat-hinh": "Hoạt hình",
    "tv-shows": "TV Shows",
  };
  const key = slug?.toLowerCase().replace(/^\/+|\/+$/g, "") || "";
  const fallback = slugMap[key] || key.replace(/-/g, " ");
  const pretty = fallback.charAt(0).toUpperCase() + fallback.slice(1);
  return `Danh sách: ${pretty}`;
}


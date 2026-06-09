import type { Metadata } from "next";

export type SearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_OG = "/og/og-home.jpg";

export function pickParam(
  sp: SearchParams | undefined,
  key: string
): string | undefined {
  const v = sp?.[key];
  return Array.isArray(v) ? v[0] : v;
}

export function toAbsoluteImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://phimimg.com/${url.replace(/^\/+/, "")}`;
}

export function prettySlug(slug: string): string {
  return (slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Chuẩn hóa mô tả SEO: bỏ HTML và entity (&nbsp;, &amp;...) */
export function cleanSeoText(input?: string | null): string {
  if (!input) return "";

  let text = input
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  for (let i = 0; i < 3; i++) {
    text = text
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#(\d+);/g, (_, code) =>
        String.fromCharCode(Number.parseInt(code, 10))
      );
  }

  return text.replace(/\s+/g, " ").trim();
}

export function truncateDescription(text: string, max = 160): string {
  const clean = cleanSeoText(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

/** Title từ API (titleHead / titlePage) — không thêm "| Phim ngay" */
export function shouldUseAbsoluteTitle(
  seo: Record<string, unknown>,
  titlePage?: string
): boolean {
  return Boolean(seo.titleHead || titlePage);
}

export function buildCanonicalPath(
  basePath: string,
  options?: { page?: number; query?: Record<string, string | undefined> }
): string {
  const params = new URLSearchParams();
  const page = options?.page ?? 1;
  if (page > 1) params.set("page", String(page));

  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value) params.set(key, value);
    }
  }

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export type PageSeoInput = {
  title: string;
  description: string;
  canonical: string;
  images?: string[];
  absoluteTitle?: boolean;
  robots?: Metadata["robots"];
  openGraphType?: "website" | "video.movie" | "video.episode";
};

/** Canonical tuyệt đối — dùng cho JSON-LD / sitemap khi cần URL đầy đủ */
export function toAbsoluteUrl(path: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const {
    title,
    description,
    canonical,
    images,
    absoluteTitle = false,
    robots = { index: true, follow: true },
    openGraphType = "website",
  } = input;

  const resolvedTitle = absoluteTitle ? { absolute: title } : title;
  const cleanDescription = truncateDescription(description);
  const ogImages =
    images?.length && images.length > 0
      ? images
      : [{ url: DEFAULT_OG, width: 1200, height: 630, alt: title }];

  return {
    title: resolvedTitle,
    description: cleanDescription,
    alternates: { canonical },
    robots,
    openGraph: {
      type: openGraphType,
      url: canonical,
      title,
      description: cleanDescription,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: ogImages.map((img) =>
        typeof img === "string" ? img : img.url
      ),
    },
  };
}

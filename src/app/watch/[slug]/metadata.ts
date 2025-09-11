import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import { normalizeSlug } from "@/lib/utils";

const SITE_URL = "https://www.phimngay.top";

const toAbsolute = (u?: string) =>
  u && /^https?:\/\//i.test(u)
    ? u
    : u
    ? `https://phimimg.com/${u.replace(/^\/+/, "")}`
    : undefined;

const stripHtml = (html?: string) =>
  (html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const sp = await searchParams;

  const epParam = Array.isArray(sp?.ep) ? sp.ep[0] : sp?.ep;
  const epName = epParam ? ` - Tập ${epParam}` : "";

  let payload: any = {};
  let errored = false;
  try {
    const res = await apiGet<any>(`/phim/${encodeURIComponent(slug)}`, {
      baseKey: "phim_root",
    });
    payload = res?.data ?? res ?? {};
  } catch {
    errored = true;
  }

  const seo = payload?.seoOnPage ?? {};
  const mv = payload?.movie ?? payload ?? {};
  const year = mv?.year || new Date().getFullYear();

  const baseTitle = seo.titleHead || mv?.name || "Xem phim online miễn phí";
  const title = `${mv?.name || baseTitle}${epName} | Vietsub HD ${year} - Phim Ngay`;

  const description =
    seo.descriptionHead ||
    stripHtml(mv?.content) ||
    `Xem ${mv?.name || "phim hay"} vietsub HD, thuyết minh, trọn bộ, miễn phí. Cập nhật nhanh nhất tại Phim Ngay.`;

  const ogImages: string[] = (seo.og_image ?? [])
    .map(toAbsolute)
    .filter(Boolean) as string[];

  const poster = toAbsolute(mv?.poster_url);
  const thumb = toAbsolute(mv?.thumb_url);

  const images = (ogImages.length ? ogImages : [poster, thumb].filter(Boolean))
    .slice(0, 3) as string[] | undefined;

  const canonicalPath = `/watch/${normalizedSlug}${epParam ? `?ep=${epParam}` : ""}`;
  const canonical = `${SITE_URL}${canonicalPath}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: errored
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "video.episode",
      url: canonical,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

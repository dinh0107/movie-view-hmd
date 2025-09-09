import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";

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
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // ✅ Phải await params trong Next.js 15
  const { slug } = await params;

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

  const baseTitle =
    seo.titleHead || mv?.name || "Rổ Phim - Xem Phim Online HD";

  const description =
    seo.descriptionHead ||
    stripHtml(mv?.content) ||
    "Xem phim online miễn phí, chất lượng HD, cập nhật nhanh.";

  const ogImages: string[] = (seo.og_image ?? [])
    .map(toAbsolute)
    .filter(Boolean) as string[];

  const poster = toAbsolute(mv?.poster_url);
  const thumb = toAbsolute(mv?.thumb_url);

  const images = (
    ogImages.length ? ogImages : [poster, thumb].filter(Boolean)
  ).slice(0, 3) as string[] | undefined;

  const canonical = `/movies/${slug}`;
  const noindex = errored || !mv?.name;

  return {
    title: baseTitle,
    description,
    alternates: { canonical },
    robots: noindex
      ? {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        }
      : { index: true, follow: true },
    openGraph: {
      type: (seo.og_type as any) || "video.movie",
      url: canonical,
      title: baseTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description,
      images,
    },
  };
}

import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";

const toAbsolute = (u: string) =>
  /^https?:\/\//i.test(u) ? u : `https://phimimg.com/${u?.replace(/^\/+/, "")}`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = Array.isArray(sp?.q) ? sp.q[0] : sp?.q;

  let data: any = null;
  try {
    if (q) {
      const path = `/tim-kiem?keyword=${encodeURIComponent(q)}`;
      const res = await apiGet<any>(path, { baseKey: "phim_v1" });
      data = res?.data ?? {};
    }
  } catch (err) {
    console.error("SEO search error:", err);
  }

  const seo = data?.seoOnPage ?? {};
  const title =
    seo.titleHead ||
    (q ? `Kết quả tìm kiếm cho: ${q}` : "Tìm kiếm phim miễn phí");
  const description =
    seo.descriptionHead ||
    (q
      ? `Xem kết quả tìm kiếm cho "${q}" online miễn phí, chất lượng HD, cập nhật nhanh.`
      : "Tìm kiếm và xem phim online miễn phí, chất lượng HD.");

  const ogImages = (seo.og_image ?? []).map(toAbsolute).filter(Boolean);

  let cover: string | undefined;
  if (ogImages.length === 0 && data?.items?.length > 0) {
    const first = data.items[0];
    if (first?.poster_url) cover = toAbsolute(first.poster_url);
    else if (first?.thumb_url) cover = toAbsolute(first.thumb_url);
  }

  const images =
    ogImages.length > 0 ? ogImages.slice(0, 3) : cover ? [cover] : undefined;

  const canonical = q ? `/search?q=${encodeURIComponent(q)}` : "/search";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: seo.og_type || "website",
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

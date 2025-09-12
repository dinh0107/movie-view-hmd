import type { Metadata } from "next";
import { apiGet } from "@/services/axiosClient";
import { prettyFromSlug } from "@/lib/utils";

const SITE_URL = "https://www.phimngay.top";

const toAbsolute = (u?: string) =>
  u && /^https?:\/\//i.test(u) ? u : u ? `https://phimimg.com/${u.replace(/^\/+/, "")}` : "";

function normalizeMeta({
  slug,
  seo,
  p,
}: {
  slug: string;
  seo?: any;
  p?: any;
}): { title: string; description: string; images: string[] } {
  const pretty = prettyFromSlug(slug);
  const year = new Date().getFullYear();

  const title =
    seo?.titleHead ||
    p?.titlePage ||
    `${pretty} Mới Nhất ${year} | Xem ${pretty} Vietsub HD - Phim Ngay`;

  const description =
    seo?.descriptionHead ||
    p?.descriptionPage ||
    `Tuyển chọn ${pretty.toLowerCase()} mới nhất ${year}, vietsub chất lượng HD. Xem ${pretty.toLowerCase()} trọn bộ, cập nhật nhanh chóng trên Phim Ngay.`;

  const rawImages = Array.isArray(seo?.og_image) ? seo.og_image : [];
  const images = rawImages.map(toAbsolute).filter(Boolean).slice(0, 3);

  return { title, description, images };
}

type PageProps = {
  params: Promise<{ slug: string }>; 
  searchParams: Promise<Record<string, string | string[] | undefined>>; 
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const slug = resolvedParams.slug;
  const sp = resolvedSearchParams;

  const pick = (k: string) => {
    const v = sp?.[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const isNewest = slug === "phim-moi-cap-nhat";
  const baseKey = isNewest ? "phim_root" : "phim_v1";

  const q = new URLSearchParams({
    page: String(pick("page") ?? 1),
    limit: String(pick("limit") ?? 15),
  });

  if (pick("category")) q.set("category", String(pick("category")));
  if (pick("country")) q.set("country", String(pick("country")));
  if (!isNewest && pick("sort_lang")) q.set("sort_lang", String(pick("sort_lang")));
  if (pick("year")) q.set("year", String(pick("year")));

  const path = `/danh-sach/${encodeURIComponent(slug)}?${q.toString()}`;
  const res = await apiGet<any>(path, {
    baseKey,
    fallbackBases: isNewest ? undefined : ["phim_root"],
  });

  const p = isNewest ? res ?? {} : res?.data ?? {};
  const seo = p?.seoOnPage ?? {};

  const { title, description, images } = normalizeMeta({ slug, seo, p });

  const canonical = `/types/${slug}`; 

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${canonical}`,
    },
    openGraph: {
      type: seo?.og_type || "website",
      url: `${SITE_URL}${canonical}`,
      title,
      description,
      images: images.length ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? images : undefined,
    },
  };
}
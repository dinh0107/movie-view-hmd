// app/types/[slug]/page.tsx
import Link from "next/link";
import TypesClient from "./TypesClient";
import type { Metadata } from "next";
import { getSeo } from "@/lib/utils";

export const revalidate = 3600; // ISR 1h

type Cat = { slug: string; name: string };
const toAbs = (u?: string) =>
  u && /^https?:\/\//i.test(u) ? u : u ? `https://phimimg.com/${u.replace(/^\/+/, "")}` : "";

function normalizeSlug(s: string) {
  return (s || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");
}

async function getCategories(): Promise<Cat[]> {
  try {
    const res = await fetch("https://phimapi.com/the-loai", { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.data?.items ?? json?.items ?? [];
    return (Array.isArray(items) ? items : [])
      .map((c: any) => ({
        slug: normalizeSlug(c?.slug ?? ""),
        name: String(c?.name ?? "").trim(),
      }))
      .filter(c => c.slug && c.name)
      .slice(0, 8); // lấy 8 mục tiêu biểu
  } catch {
    return [];
  }
}

function PopularCategoriesSSR({ categories }: { categories: Cat[] }) {
  if (!categories?.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Thể loại phổ biến</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`} // lowercase, không slash cuối
            className="text-sm bg-gray-800 text-white/90 hover:bg-red-600 hover:text-white transition px-3 py-1.5 rounded-full border border-white/10"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

const ORIGIN = "https://www.phimngay.top";
const MAP: Record<string, string> = {
  "phim-moi-cap-nhat": "Phim mới cập nhật",
  "phim-le": "Phim lẻ",
  "phim-bo": "Phim bộ",
  "hoat-hinh": "Phim Hoạt hình",
  "tv-shows": "TV Shows",
};
const pretty = (s: string) =>
  (s || "").replace(/^\/+|\/+$/g, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const DEFAULT_OG = "/og/6199290559244388322.jpg";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeo(slug);
  const normalized = (slug || "").trim().toLowerCase();
  const readable = normalized ? pretty(normalized) : "Danh sách phim";
  const t = MAP[normalized] ?? readable;

  const canonicalPath = normalized ? `/types/${normalized}` : `/types`;
  const title = seo.titleHead ?? `Danh sách phim ${t}, tốc độ cao Full HD`;
  const desc =  seo.descriptionHead ??  `Xem ${t} mới nhất, tốc độ nhanh, miễn phí.`;
  const ogDesc = seo.descriptionHead ?? `Thưởng thức ${t} online, cập nhật mỗi ngày.`;
  const ogImages: string[] = Array.isArray(seo?.og_image)
    ? seo.og_image.map(toAbs).filter(Boolean)
    : [];
    
  let cover: string | undefined;
  if (!ogImages.length && Array.isArray(seo?.items) && seo.items.length) {
    cover = toAbs(seo.items[0]?.poster_url) || toAbs(seo.items[0]?.thumb_url);
  }
  const images = ogImages.length ? ogImages.slice(0, 3) : cover ? [cover] : undefined;
  return {
    metadataBase: new URL(ORIGIN),
    title,
    description: desc,
    alternates: { canonical: canonicalPath },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    keywords: [t, "xem phim online", "phim HD", "phim mới", "xem phim miễn phí"],
    openGraph: {
      type: seo.og_type ?? "website",
      url: canonicalPath,
      title: t,
      description: ogDesc,
      siteName: "Phim ngay",
      locale: "vi_VN",
      images
    },
    twitter: {
      card: "summary_large_image",
      title: t,
      description: `Xem ${t} trên Phim ngay.`,
     images
    },
    applicationName: "Phim ngay",
  };
}

export default async function Page() {
  const categories = await getCategories();
  return (
    <>
      <PopularCategoriesSSR categories={categories} />
      <TypesClient />
    </>
  );
}

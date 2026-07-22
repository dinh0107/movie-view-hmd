import type { Metadata } from "next";
import HeroBannerSlider from "@/components/layout/carousel/HeroBannerSlider";
import HotSearchBannerSlider from "@/components/layout/carousel/HotSearchBannerSlider";
import MovieCategories from "@/components/sections/MovieSection";
import { HomeSeo } from "@/components/seo/HomeSeo";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute:
      "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
  },
  alternates: {
    canonical: "/",
    languages: { "vi-VN": "/" },
  },
  openGraph: {
    url: SITE_URL,
    title: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    description:
      "Xem phim online miễn phí, HD, cập nhật nhanh. Kho phim đa dạng: hành động, tình cảm, hoạt hình...",
    images: [
      {
        url: "/og/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "Phim ngay - Xem Phim Online HD",
      },
    ],
  },
};

export default async function HomePage() {
  return (
    <main>
      <HomeSeo />
      <HeroBannerSlider />
      <MovieCategories />
      <HotSearchBannerSlider />
    </main>
  );
}

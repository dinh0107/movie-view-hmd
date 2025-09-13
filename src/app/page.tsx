import HeroBannerSlider from "@/components/layout/carousel/HeroBannerSlider";
import HotSearchBannerSlider from "@/components/layout/carousel/HotSearchBannerSlider";
import { CardListSection } from "@/components/sections/CardListSection";
import MovieCategories from "@/components/sections/MovieSection";
import PersonListSection from "@/components/sections/PersonListSection";
import { movieCountries, movieGenres } from "@/contants/mock-movies";
import React from "react";
import type { Metadata } from "next";

const SITE_URL = "https://www.phimngay.top";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    absolute: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh", // 👈 tuyệt đối
  },
  description:
    "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại: hành động, tình cảm, kinh dị, hoạt hình, anime. Xem mượt trên mọi thiết bị, không cần đăng ký.",
  keywords: [
    "xem phim online",
    "phim HD",
    "phim mới cập nhật",
    "phim hành động",
    "phim lẻ",
    "phim bộ",
    "xem phim miễn phí",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { "vi-VN": SITE_URL },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Phim ngay",
    title: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    description:
      "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại, giao diện thân thiện, xem mượt trên mọi thiết bị.",
    locale: "vi_VN",
    images: [
      {
        url: `${SITE_URL}/og/6199290559244388322.jpg`,
        width: 1200,
        height: 630,
        alt: "Phim ngay - Xem Phim Online HD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    description:
      "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại, giao diện thân thiện, xem mượt trên mọi thiết bị.",
    images: [`${SITE_URL}/og/6199290559244388322.jpg`],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/png" }],
  },
  applicationName: "Phim ngay",
};
const HomePage = () => {
  return (
    <main>
      <HeroBannerSlider />
      <MovieCategories />
      <HotSearchBannerSlider />
    </main>
  );
};

export default HomePage;


import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderLayout from "@/components/layout/header/HeaderLayout";
import FooterLayout from "@/components/layout/footer/FooterLayout";
import { MenuProvider } from "@/context/MenuContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import BottomAdBanner from "@/components/ui/Ads";
import FacebookSdk from "@/components/sections/FacebookSdk";

const SITE_URL = "https://www.phimngay.top";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    template: "%s | Phim ngay",
  },
  description:
    "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại: hành động, tình cảm, kinh dị, hoạt hình, anime, xem mượt trên mọi thiết bị.",
  keywords: [
    "xem phim online",
    "phim HD",
    "phim mới",
    "phim hành động",
    "phim lẻ",
    "phim chiếu rạp",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { "vi-VN": SITE_URL },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
      "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại: hành động, tình cảm, kinh dị, hoạt hình, anime. Giao diện thân thiện, không cần đăng ký, xem mượt trên mọi thiết bị.",
    locale: "vi_VN",
    images: [
      {
        url: "https://www.phimngay.top/og/6199290559244388322.jpg",
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
      "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại: hành động, tình cảm, kinh dị, hoạt hình, anime. Giao diện thân thiện, không cần đăng ký, xem mượt trên mọi thiết bị.",
    images: ["https://www.phimngay.top/og/6199290559244388322.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/png" }],
  },
  applicationName: "Phim ngay",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
        <MenuProvider>
          <HeaderLayout />
          {children}
          <BottomAdBanner />
          <Analytics />
          <SpeedInsights />
          <FooterLayout />
          <FacebookSdk />
        </MenuProvider>

        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-CVV3RVL1X1" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CVV3RVL1X1');
          `}
        </Script>

        {/* JSON-LD: để ở body, không cần nhét vào <head> */}
        <Script id="site-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Phim ngay",
            url: "https://www.phimngay.top/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.phimngay.top/search?query={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>


        {/* <script
          type="text/javascript"
          src="//pl27607255.revenuecpmgate.com/53/97/f1/5397f120c7c37e17c9c154ad51c3e672.js"
        ></script> */}
      </body>
    </html>
  );
}

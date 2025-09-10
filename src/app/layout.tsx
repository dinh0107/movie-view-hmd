import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderLayout from "@/components/layout/header/HeaderLayout";
import FooterLayout from "@/components/layout/footer/FooterLayout";
import { MenuProvider } from "@/context/MenuContext";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import BottomAdBanner from "@/components/ui/Ads";

const SITE_URL = "https://www.phimngay.top/";

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
    "Phim ngay - Website xem phim online miễn phí, chất lượng HD, cập nhật phim mới nhất nhanh chóng. Thưởng thức kho phim đa dạng từ hành động, tình cảm đến hoạt hình.",
  alternates: {
    canonical: "/",
    languages: { "vi-VN": "/" },
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
      "Xem phim online miễn phí, HD, cập nhật nhanh. Kho phim đa dạng: hành động, tình cảm, hoạt hình...",
    locale: "vi_VN",
    images: [
      { url: "/og/og-home.jpg", width: 1200, height: 630, alt: "Phim ngay - Xem Phim Online HD" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    description:
      "Xem phim online miễn phí, HD, cập nhật nhanh. Kho phim đa dạng: hành động, tình cảm, hoạt hình...",
    images: ["/og/og-home.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/png" }],
  },
  applicationName: "Phim ngay",
  // manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta name="monetag" content="dc0b7a9e690910128eaa099f540b4082" />
        {/* <Script id="groleegni" strategy="afterInteractive">
        {`(function(s){
            s.dataset.zone='9852719';
            s.src='https://groleegni.net/vignette.min.js';
        })([document.documentElement, document.body]
            .filter(Boolean).pop()
            .appendChild(document.createElement('script')));`}
      </Script> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Phim ngay",
              url: "https://www.phimngay.top/",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.phimngay.top/tim-kiem?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
        <MenuProvider>
          <HeaderLayout />
          {children}
            <BottomAdBanner />
          <Analytics />
          <SpeedInsights />
          <FooterLayout />
        </MenuProvider>
        <script type='text/javascript' src='//pl27607255.revenuecpmgate.com/53/97/f1/5397f120c7c37e17c9c154ad51c3e672.js'></script>
      </body>
    </html>
  );
}

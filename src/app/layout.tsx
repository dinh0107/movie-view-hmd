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
  other: {
    clckd: "f6d66ab14a5b79537442b68726936b49",
  },
  title: {
    default: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    template: "%s | Phim ngay",
  },
  description:
    "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại: hành động, tình cảm, kinh dị, hoạt hình, anime, xem mượt trên mọi thiết bị.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "vi": SITE_URL,
      "en": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "Phim ngay",
    title: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    description:
      "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại: hành động, tình cảm, kinh dị, hoạt hình, anime. Giao diện thân thiện, không cần đăng ký, xem mượt trên mọi thiết bị.",
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
      "Phim Ngay là website xem phim online miễn phí, chất lượng HD. Cập nhật phim mới nhanh chóng, đa dạng thể loại",
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
          {/* <BottomAdBanner /> */}
          <Analytics />
          <SpeedInsights />
          <FooterLayout />
          <FacebookSdk />
        </MenuProvider>
        {/* <Script
          src="//pl27607255.revenuecpmgate.com/53/97/f1/5397f120c7c37e17c9c154ad51c3e672.js"
          strategy="afterInteractive"
        /> */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-CVV3RVL1X1" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CVV3RVL1X1');
          `}
        </Script>
        <Script
          src="https://developers.trustedaccounts.org/trusted-sdk/trusted-traffic.js"
          strategy="afterInteractive"
        />
        <Script id="trusted-traffic-init" strategy="afterInteractive">
          {`
            (function initTT(){
              if (window.TrustedTraffic) {
                try {
                  new window.TrustedTraffic({
                    clientId: "950f7656-a2c2-44a7-a49f-c3aff904df69"
                  }).init();
                } catch (e) {
                  console.error("TrustedTraffic init failed:", e);
                }
              } else {
                // SDK chưa sẵn sàng → thử lại
                setTimeout(initTT, 50);
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}

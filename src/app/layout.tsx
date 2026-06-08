import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderLayout from "@/components/layout/header/HeaderLayout";
import FooterLayout from "@/components/layout/footer/FooterLayout";
import { MenuProvider } from "@/context/MenuContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1117" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    template: "%s | Phim ngay",
  },
  description:
    "Phim ngay - Website xem phim online miễn phí, chất lượng HD, cập nhật phim mới nhất nhanh chóng. Thưởng thức kho phim đa dạng từ hành động, tình cảm đến hoạt hình.",
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
    siteName: "Phim ngay",
    title: "Phim ngay - Xem Phim Online HD, Phim Mới Cập Nhật Nhanh",
    description:
      "Xem phim online miễn phí, HD, cập nhật nhanh. Kho phim đa dạng: hành động, tình cảm, hoạt hình...",
    locale: "vi_VN",
    images: [
      {
        url: "/og/og-home.jpg",
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
      "Xem phim online miễn phí, HD, cập nhật nhanh. Kho phim đa dạng: hành động, tình cảm, hoạt hình...",
    images: ["/og/og-home.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  applicationName: "Phim ngay",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider>
          <MenuProvider>
            <div className="flex min-h-screen flex-col">
              <HeaderLayout />
              <main className="flex-1">{children}</main>
              <FooterLayout />
            </div>
            <Analytics />
            <SpeedInsights />
          </MenuProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Phim ngay",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?query={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import AgeVerificationModal from "@/components/UI/AgeVerificationModal";
import FloatingActionBar from "@/components/UI/FloatingActionBar";
import { siteConfig } from "@/data/siteConfig";
import { getSiteUrl } from "@/lib/utils";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#8b0000",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RƯỢU TỐT — Rượu Vang Nhập Khẩu Chính Hãng & Bảng Báo Giá 2026",
    template: "%s | RƯỢU TỐT",
  },
  description: `${siteConfig.companyName} chuyên phân phối rượu vang Chile, Pháp, Ý, Tây Ban Nha, Úc chính hãng. Đầy đủ hóa đơn VAT, chứng từ CO/CQ, bảng báo giá 2026 niêm yết tốt nhất. Giao hàng hỏa tốc 2 giờ.`,
  keywords: [
    "rượu vang",
    "rượu vang nhập khẩu",
    "rượu tốt",
    "báo giá rượu vang 2026",
    "rượu vang chile",
    "santa carolina carmenere",
    "rượu vang ý",
    "rượu vang pháp",
    "champagne",
    "vang sủi",
    "huy phong wine",
    "quà tặng rượu vang doanh nghiệp",
  ],
  authors: [{ name: "RƯỢU TỐT — Công ty CP Huy Phong", url: siteUrl }],
  creator: "RƯỢU TỐT",
  publisher: "Công ty Cổ phần Huy Phong",
  applicationName: "Rượu Tốt",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "RƯỢU TỐT — Rượu Vang Nhập Khẩu Chính Hãng",
    title: "RƯỢU TỐT — Rượu Vang Nhập Khẩu Chính Hãng & Bảng Báo Giá 2026",
    description: "Hệ thống phân phối rượu vang Chile, Pháp, Ý, Champagne chính hãng uy tín số 1 Việt Nam. Đầy đủ hóa đơn VAT, chứng từ CO/CQ, giao hàng hỏa tốc 2H.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RƯỢU TỐT — Rượu Vang Nhập Khẩu Chính Hãng & Bảng Báo Giá 2026",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RƯỢU TỐT — Rượu Vang Nhập Khẩu Chính Hãng & Bảng Báo Giá 2026",
    description: "Hệ thống phân phối rượu vang Chile, Pháp, Ý, Champagne chính hãng uy tín số 1 Việt Nam. Đầy đủ hóa đơn VAT, CO/CQ.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-ruoutot",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "LiquorStore",
    name: "RƯỢU TỐT — Công ty Cổ phần Huy Phong",
    alternateName: ["Rượu Tốt", "Huy Phong Wine", "Vang Huy Phong"],
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    image: `${siteUrl}/images/og-image.jpg`,
    description: "Hệ thống phân phối rượu vang nhập khẩu chính hãng số 1 Việt Nam. Đầy đủ hóa đơn VAT, chứng từ CO/CQ, bảng báo giá 2026 niêm yết tốt nhất.",
    telephone: siteConfig.hotline,
    email: siteConfig.email,
    priceRange: "₫₫₫",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: "Hà Nội",
      addressRegion: "Hà Nội",
      addressCountry: "VN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "21.0189",
      longitude: "105.8239",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "08:00",
        closes: "22:00",
      },
    ],
    sameAs: [
      "https://ruoutot.net",
      "https://facebook.com/ruoutot.net",
    ],
  };

  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RƯỢU TỐT",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/san-pham?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="vi">
      <head>
        {/* Google Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[#fcfcfc] text-gray-900 font-sans antialiased">
        <CartProvider>
          <WishlistProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <AgeVerificationModal />
            <FloatingActionBar />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

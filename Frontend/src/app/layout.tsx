import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import { getSiteUrl } from "@/lib/utils";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "API Common — Hệ Thống Quản Trị Proxy Seeding & Background Runner",
    template: "%s | API Common",
  },
  description:
    "Hệ thống quản trị API Common: Tự động chạy ngầm xoay vòng URL & Proxy SOCKS5/SOCKS5H 24/7, tracking affiliate redirect, kiểm tra IP và phân tích landing page.",
  applicationName: "API Common",
  authors: [{ name: "API Common Team" }],
  generator: "Next.js",
  keywords: [
    "API Common",
    "Proxy Seeding",
    "SOCKS5 Proxy",
    "Auto Runner",
    "Background Seeding",
    "Affiliate Redirect",
    "Affiliate Tracking",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "API Common",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://api-common.vercel.app/dashboard",
    siteName: "API Common",
    title: "API Common — Hệ Thống Quản Trị Proxy Seeding & Background Runner",
    description:
      "Tự động chạy ngầm xoay vòng URL & Proxy SOCKS5/SOCKS5H 24/7, tracking affiliate redirect, kiểm tra IP và phân tích landing page.",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "API Common Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "API Common — Hệ Thống Quản Trị Proxy Seeding & Background Runner",
    description:
      "Tự động chạy ngầm xoay vòng URL & Proxy SOCKS5/SOCKS5H 24/7, tracking affiliate redirect.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="API Common" />
      </head>
      <body className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans antialiased">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}

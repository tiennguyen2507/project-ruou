import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: {
    default: "API Common — Dashboard",
    template: "%s | API Common",
  },
  description:
    "Hệ thống quản trị API Common: Proxy Seeding, Background Auto Runner và dịch vụ API tập trung.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

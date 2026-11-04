import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import AgeVerificationModal from "@/components/UI/AgeVerificationModal";
import FloatingActionBar from "@/components/UI/FloatingActionBar";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "RƯỢU TỐT - Rượu Vang Nhập Khẩu Chính Hãng Giá Ưu Đãi Báo Giá 2026",
  description: `${siteConfig.companyName} chuyên phân phối rượu vang Chile, Pháp, Ý, Tây Ban Nha, Úc chính hãng. Đầy đủ hóa đơn VAT, chứng từ CO/CQ, bảng báo giá 2026 niêm yết tốt nhất.`,
  keywords: "rượu vang chile, santa carolina carmenere, rượu vang ý, rượu vang pháp, champagne, vang sủi, báo giá rượu vang 2026, ruou tot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
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

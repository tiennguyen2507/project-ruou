"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WineProduct, fetchAllProducts } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import ProductCard from "@/components/Product/ProductCard";
import { formatPrice } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Award,
  Phone,
  FileText,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: "/images/banners/hero-balvenie.webp",
      title: "TINH HOA RƯỢU VANG THỦ CÔNG",
      subtitle: "BẢNG BÁO GIÁ NIÊM YẾT 2026 — CÔNG TY CP HUY PHONG",
      buttonText: "CẬP NHẬT NGAY BẢNG GIÁ MỚI NHẤT TẠI ĐÂY",
      link: "/bao-gia-2026",
    },
    {
      image: "/images/banners/banner-whisky.jpg",
      title: "RƯỢU VANG & BIA NHẬP KHẨU CHÍNH HÃNG",
      subtitle: "CAM KẾT 100% CHÍNH HÃNG • ĐẦY ĐỦ HÓA ĐƠN VAT, CO/CQ",
      buttonText: "KHÁM PHÁ BỘ SƯU TẬP 111+ DÒNG VANG",
      link: "/san-pham",
    },
  ];

  const occasions = [
    { title: "SINH NHẬT", img: "/images/occasions/sinh-nhat.jpg", href: "/san-pham?dip=sinh-nhat" },
    { title: "TIẾP KHÁCH", img: "/images/occasions/tiep-khach.jpg", href: "/san-pham?dip=tiep-khach" },
    { title: "KỶ NIỆM", img: "/images/occasions/ky-niem.jpg", href: "/san-pham?dip=ky-niem" },
    { title: "TRI ÂN", img: "/images/occasions/tri-an.jpg", href: "/san-pham?dip=tri-an" },
    { title: "TÂN GIA", img: "/images/occasions/tan-gia.jpg", href: "/san-pham?dip=tan-gia" },
    { title: "ĐÁM CƯỚI", img: "/images/occasions/dam-cuoi.jpg", href: "/san-pham?dip=dam-cuoi" },
    { title: "THĂNG CHỨC", img: "/images/occasions/thang-chuc.jpg", href: "/san-pham?dip=thang-chuc" },
  ];

  const showcaseCards = [
    { title: "Vang đỏ", img: "/images/banners/banner-vang-do.jpg", href: "/san-pham?loai-vang=Vang Đỏ" },
    { title: "Champagne", img: "/images/banners/banner-champagne.jpg", href: "/san-pham?loai-vang=Champagne" },
    { title: "Vang trắng", img: "/images/banners/banner-vang-trang.jpg", href: "/san-pham?loai-vang=Vang Trắng" },
    { title: "Bia nhập khẩu", img: "/images/banners/banner-bia.jpg", href: "/san-pham" },
  ];

  const quickFilterPillsRow1 = [
    { label: "Vang Hồng", href: "/san-pham?loai-vang=Vang Hồng" },
    { label: "Vang Ngọt", href: "/san-pham?loai-vang=Vang Ngọt" },
    { label: "Vang Bịch", href: "/san-pham?loai-vang=Vang Bịch" },
    { label: "Champagne & Sủi", href: "/san-pham?loai-vang=Champagne" },
    { label: "Vang 0.0% & Cocktail", href: "/san-pham?loai-vang=Không Cồn" },
  ];

  const quickFilterPillsRow2 = [
    { label: "Vang Chile", href: "/san-pham?quoc-gia=Chile" },
    { label: "Vang Ý", href: "/san-pham?quoc-gia=Ý" },
    { label: "Vang Pháp", href: "/san-pham?quoc-gia=Pháp" },
    { label: "Vang Tây Ban Nha", href: "/san-pham?quoc-gia=Tây Ban Nha" },
    { label: "Vang Úc", href: "/san-pham?quoc-gia=Úc" },
  ];

  const [products, setProducts] = useState<WineProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts(100).then((data) => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  // Top 10 wines to show on main shelf
  const featuredWines = products.slice(0, 10);
  const chileWines = products.filter((p) => p.country === "Chile").slice(0, 5);

  return (
    <div className="space-y-12 pb-16 bg-[#fafafa]">
      {/* Primary Semantic H1 for Google Search Crawlers */}
      <h1 className="sr-only">
        RƯỢU TỐT — Hệ Thống Rượu Vang Nhập Khẩu Chính Hãng &amp; Bảng Báo Giá 2026 (Công Ty CP Huy Phong)
      </h1>

      {/* 1. HERO CAROUSEL - Ruoutot Full Width Luxury Slider */}
      <section className="relative w-full overflow-hidden bg-black aspect-[16/6] min-h-[360px] md:min-h-[500px]">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentSlide === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col items-center justify-end pb-12 md:pb-16 px-4 text-center">
              <span className="text-[#f9d776] text-xs md:text-sm font-bold tracking-widest uppercase mb-1 drop-shadow">
                {slide.subtitle}
              </span>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-black text-white tracking-wide mb-6 drop-shadow-md">
                {slide.title}
              </h2>
              <Link
                href={slide.link}
                className="bg-[#b30000] hover:bg-[#850000] text-white font-bold px-8 py-3 rounded-full text-xs md:text-sm uppercase tracking-wider transition shadow-2xl border border-white/20 hover:scale-105"
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        ))}

        {/* Carousel controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel indicator dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx ? "bg-white w-6" : "bg-white/50"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. SECTION: Quà tặng và các dịp lễ - Ruoutot 7 Circular Occasion Categories */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Quà tặng và các dịp lễ
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1.5 max-w-xl mx-auto">
            Cùng &quot;Rượu Tốt&quot; chọn đúng và đủ thức uống để bạn có một buổi tiệc trọn vẹn và ý nghĩa!
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 md:gap-6 justify-center">
          {occasions.map((occ, idx) => (
            <Link
              key={idx}
              href={occ.href}
              className="flex flex-col items-center group text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#b30000] shadow-sm transition duration-300 transform group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={occ.img}
                  alt={occ.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] md:text-xs font-bold text-gray-800 mt-2.5 group-hover:text-[#b30000] transition uppercase tracking-wide">
                {occ.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. SECTION: 5 Large Category Showcase Cards (2x2 grid + 1 wide) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {showcaseCards.map((card, idx) => (
            <Link
              key={idx}
              href={card.href}
              className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow group block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.img}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6">
                <span className="text-white font-serif font-bold text-xl md:text-2xl drop-shadow group-hover:text-[#f9d776] transition">
                  {card.title}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Wide Whisky Banner Card */}
        <Link
          href="/san-pham"
          className="relative aspect-[21/8] md:aspect-[3/1] rounded-2xl overflow-hidden shadow group block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/banners/banner-whisky.jpg"
            alt="Whisky"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-6">
            <span className="text-white font-serif font-bold text-xl md:text-3xl drop-shadow group-hover:text-[#f9d776] transition">
              Whisky & Bộ Sưu Tập Rượu Mạnh Cao Cấp
            </span>
          </div>
        </Link>
      </section>

      {/* 4. RED QUICK FILTER PILLS - 2 rows of 5 buttons matching Ruoutot */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-2.5">
          {quickFilterPillsRow1.map((pill, idx) => (
            <Link
              key={idx}
              href={pill.href}
              className="bg-[#b30000] hover:bg-[#850000] text-white font-bold text-xs py-2.5 px-3 rounded-lg text-center transition shadow-sm hover:shadow"
            >
              {pill.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {quickFilterPillsRow2.map((pill, idx) => (
            <Link
              key={idx}
              href={pill.href}
              className="bg-[#b30000] hover:bg-[#850000] text-white font-bold text-xs py-2.5 px-3 rounded-lg text-center transition shadow-sm hover:shadow"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 5. MAIN SHELF: Rượu Vang (5 columns on desktop) */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Rượu vang
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-2xl mx-auto leading-relaxed">
            Rượu vang là một loại đồ uống có cồn được làm bằng nước ép nho lên men. Nghe đơn giản là thế, song rượu vang còn là văn hoá, là lịch sử, là nghệ thuật, là cả một thế giới phức tạp đáng khám phá.
          </p>
        </div>

        {/* 5 Columns Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {featuredWines.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/san-pham"
            className="inline-block bg-[#b30000] hover:bg-[#850000] text-white font-bold px-10 py-3 rounded-full text-xs md:text-sm uppercase tracking-wider transition shadow-md"
          >
            Xem tất cả
          </Link>
        </div>
      </section>

      {/* 6. SECTION: Khám phá theo vùng (Vang Ý, Vang Pháp, Vang Chile) */}
      <section className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Khám phá theo vùng
          </h2>
        </div>

        {/* Region 1: RƯỢU VANG Ý - Terracotta Card */}
        <div className="rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2 bg-[#d0532b] text-white">
          <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center space-y-6">
            <h3 className="font-serif font-bold text-2xl md:text-3xl uppercase tracking-wider">
              RƯỢU VANG Ý
            </h3>

            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm font-medium">
              <Link href="/san-pham?vung=Abruzzo" className="hover:underline">Abruzzo</Link>
              <Link href="/san-pham?vung=Puglia" className="hover:underline">Puglia</Link>
              <Link href="/san-pham?vung=Tuscany" className="hover:underline">Tuscany</Link>
              <Link href="/san-pham?vung=Sicily" className="hover:underline">Sicily</Link>
              <Link href="/san-pham?vung=Veneto" className="hover:underline">Veneto</Link>
              <Link href="/san-pham?vung=Valpolicella" className="hover:underline">Valpolicella</Link>
            </div>

            <Link
              href="/san-pham?quoc-gia=Ý"
              className="border border-white/60 hover:bg-white hover:text-[#d0532b] text-white font-bold px-8 py-2 rounded-full text-xs uppercase tracking-wider transition"
            >
              Xem thêm
            </Link>
          </div>

          <div className="relative min-h-[260px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/banners/cac-vung-vang-y.webp"
              alt="Rượu vang Ý"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Region 2: RƯỢU VANG PHÁP - Dark Espresso Card */}
        <div className="rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2 bg-[#1c1512] text-white">
          <div className="relative min-h-[260px] order-2 md:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/banners/cac-vung-vang-phap.webp"
              alt="Rượu vang Pháp"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center space-y-6 order-1 md:order-2">
            <h3 className="font-serif font-bold text-2xl md:text-3xl uppercase tracking-wider">
              RƯỢU VANG PHÁP
            </h3>

            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm font-medium text-gray-300">
              <Link href="/san-pham?vung=Bordeaux" className="hover:text-white">Bordeaux</Link>
              <Link href="/san-pham?vung=Burgundy" className="hover:text-white">Burgundy</Link>
              <Link href="/san-pham?vung=Champagne" className="hover:text-white">Champagne</Link>
              <Link href="/san-pham?vung=Margaux" className="hover:text-white">Margaux</Link>
              <Link href="/san-pham?vung=Languedoc" className="hover:text-white">Languedoc</Link>
              <Link href="/san-pham?vung=Alsace" className="hover:text-white">Alsace</Link>
              <Link href="/san-pham?vung=Rhone Valley" className="hover:text-white">Rhone Valley</Link>
              <Link href="/san-pham?vung=Cahors" className="hover:text-white">Cahors</Link>
            </div>

            <Link
              href="/san-pham?quoc-gia=Pháp"
              className="border border-white/60 hover:bg-white hover:text-[#1c1512] text-white font-bold px-8 py-2 rounded-full text-xs uppercase tracking-wider transition"
            >
              Xem thêm
            </Link>
          </div>
        </div>

        {/* Region 3: RƯỢU VANG CHILE - Deep Burgundy Card */}
        <div className="rounded-2xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2 bg-[#4a0e17] text-white">
          <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center space-y-6">
            <h3 className="font-serif font-bold text-2xl md:text-3xl uppercase tracking-wider">
              RƯỢU VANG CHILE
            </h3>

            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm font-medium text-gray-200">
              <Link href="/san-pham?vung=Central Valley" className="hover:underline">Central Valley</Link>
              <Link href="/san-pham?vung=Rapel Valley" className="hover:underline">Rapel Valley</Link>
              <Link href="/san-pham?vung=Maipo Valley" className="hover:underline">Maipo Valley</Link>
              <Link href="/san-pham?vung=Colchagua" className="hover:underline">Colchagua</Link>
              <Link href="/san-pham?vung=Maule Valley" className="hover:underline">Maule Valley</Link>
              <Link href="/san-pham?vung=Casablanca" className="hover:underline">Casablanca</Link>
            </div>

            <Link
              href="/san-pham?quoc-gia=Chile"
              className="border border-white/60 hover:bg-white hover:text-[#4a0e17] text-white font-bold px-8 py-2 rounded-full text-xs uppercase tracking-wider transition"
            >
              Xem thêm
            </Link>
          </div>

          <div className="relative min-h-[260px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/banners/cac-vung-vang-chile.webp"
              alt="Rượu vang Chile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 7. PDF BÁO GIÁ 2026 OFFICIAL PROMO BOX */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#f0ebe1] border border-amber-200/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#b30000] text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#b30000] uppercase tracking-wider">
                Tài Liệu Báo Giá Chính Thức 2026
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mt-0.5">
                Bảng Báo Giá Rượu Vang Huy Phong (Phiên Bản 17082026)
              </h3>
              <p className="text-xs text-gray-600 mt-1.5 max-w-xl leading-relaxed">
                Hiệu lực đến 31/03/2027. Đầy đủ bảng giá niêm yết đã bao gồm thuế VAT 10% cho 111 dòng vang Pháp, Ý, Chile, Tây Ban Nha, Úc cao cấp.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/bao-gia-2026"
              className="bg-[#b30000] hover:bg-[#850000] text-white font-bold py-3 px-6 rounded-full text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Tra Cứu Bảng Giá Online</span>
            </Link>

            <a
              href="/BAO GIA 2026 - SHOP 170826.pdf"
              download="BAO_GIA_2026_VANG_HUY_PHONG.pdf"
              className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold py-3 px-6 rounded-full text-xs uppercase tracking-wider transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#b30000]" />
              <span>Tải File PDF Gốc (28 Trang)</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. DELIVERY BANNER - Ruoutot exact Pill */}
      <section className="max-w-7xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-3 bg-[#a4000b] text-white font-bold text-xs md:text-sm py-3 px-8 rounded-full shadow-lg">
          <span>Ship hàng nhanh trong giờ - Giao hàng nhanh toàn quốc</span>
          <Truck className="w-5 h-5 text-white" />
        </div>
      </section>
    </div>
  );
}

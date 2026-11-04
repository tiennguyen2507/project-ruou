"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WineProduct, fetchAllProducts, getApiBaseUrl } from "@/data/products";
import { getSiteUrl } from "@/lib/utils";
import ProductCard from "@/components/Product/ProductCard";
import {
  Filter,
  Search,
  RotateCcw,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get("quoc-gia") || "all";
  const initialWineType = searchParams.get("loai-vang") || "all";
  const initialRegion = searchParams.get("vung") || "all";
  const initialQuery = searchParams.get("q") || "";

  // State
  const [productList, setProductList] = useState<WineProduct[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [selectedWineType, setSelectedWineType] = useState<string>(initialWineType);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    fetch(`${apiUrl}/products?limit=200`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.data && json.data.length > 0) {
          setProductList(json.data);
        }
      })
      .catch(() => { });
  }, []);

  // Subcategories matching Ruoutot
  const subCategories = [
    { title: "Rượu vang Đỏ", img: "/images/categories/cat-vang-do.png", type: "Vang Đỏ" },
    { title: "Rượu vang Trắng", img: "/images/categories/cat-vang-trang.png", type: "Vang Trắng" },
    { title: "Vang sủi", img: "/images/categories/cat-vang-sui.png", type: "Champagne" },
    { title: "Rượu Vang Bịch", img: "/images/categories/cat-vang-bich.png", type: "Vang Bịch" },
  ];

  // Countries
  const countryFilters = [
    { label: "Tất cả", val: "all" },
    { label: "Chile", val: "Chile" },
    { label: "Ý (Italy)", val: "Ý" },
    { label: "Pháp (France)", val: "Pháp" },
    { label: "Tây Ban Nha", val: "Tây Ban Nha" },
    { label: "Úc (Australia)", val: "Úc" },
  ];

  // Wine types
  const wineTypeFilters = [
    { label: "Tất cả loại vang", val: "all" },
    { label: "Vang Đỏ", val: "Vang Đỏ" },
    { label: "Vang Trắng", val: "Vang Trắng" },
    { label: "Champagne & Sủi", val: "Champagne" },
    { label: "Không Cồn (0.0%)", val: "Không Cồn" },
  ];

  // Filtering
  const filteredProducts = useMemo(() => {
    return productList.filter((p) => {
      // Country
      if (selectedCountry !== "all" && p.country !== selectedCountry) {
        return false;
      }
      // Wine Type
      if (selectedWineType !== "all" && !p.wineType.includes(selectedWineType)) {
        return false;
      }
      // Region
      if (selectedRegion !== "all" && !p.region.toLowerCase().includes(selectedRegion.toLowerCase())) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.grapes.some((g) => g.toLowerCase().includes(q)) ||
          p.classification.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedCountry, selectedWineType, selectedRegion, searchQuery, productList]);

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      list.sort((a, b) => b.discountPercent - a.discountPercent);
    }
    return list;
  }, [filteredProducts, sortBy]);

  const resetFilters = () => {
    setSelectedCountry("all");
    setSelectedWineType("all");
    setSelectedRegion("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="space-y-10 pb-16 bg-[#fafafa]">
      {/* Google CollectionPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Danh Mục Rượu Vang Nhập Khẩu Chính Hãng — RƯỢU TỐT",
            description:
              "Khám phá 111+ dòng rượu vang Chile, Pháp, Ý, Tây Ban Nha, Úc, Champagne chính hãng với bảng giá 2026 niêm yết tốt nhất.",
            url: `${getSiteUrl()}/san-pham`,
            numberOfItems: sortedProducts.length,
          }),
        }}
      />
      {/* 1. TOP HERO CATEGORY BANNER - Ruoutot exact aesthetic */}
      <section className="relative w-full overflow-hidden bg-stone-900 min-h-[300px] md:min-h-[420px] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/banners/banner-danh-muc-vang.webp"
          alt="Rượu Vang Nhập Khẩu"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-12 text-white max-w-2xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-md">
            Rượu vang
          </h1>
          <p className="text-xs md:text-sm text-gray-200 leading-relaxed drop-shadow">
            Rượu vang là một loại đồ uống có cồn được làm bằng nước ép nho lên men. Nghe đơn giản là thế, song rượu vang còn là văn hoá, là lịch sử, là nghệ thuật, là cả một thế giới phức tạp đáng khám phá. Nếu bạn cũng từng tò mò vì sao...
          </p>
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className="bg-[#b30000] hover:bg-[#850000] text-white font-bold px-7 py-2.5 rounded-full text-xs uppercase tracking-wider transition shadow-md"
            >
              Xem tất cả
            </button>
          </div>
        </div>
      </section>

      {/* 2. 4 SUB-CATEGORY CARDS - Ruoutot style with elegant images */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {subCategories.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedWineType(sub.type);
                window.scrollTo({ top: 500, behavior: "smooth" });
              }}
              className="group flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition duration-300 border border-gray-200 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sub.img}
                  alt={sub.title}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-500"
                />
              </div>
              <h3 className="font-serif font-bold text-sm md:text-base text-gray-900 mt-3 group-hover:text-[#b30000] transition">
                {sub.title}
              </h3>
            </button>
          ))}
        </div>
      </section>

      {/* 3. MAIN PRODUCT CATALOG SECTION */}
      <section className="max-w-7xl mx-auto px-4 pt-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Sản phẩm nổi bật
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Hiển thị <strong>{sortedProducts.length}</strong> / 111 sản phẩm chính hãng theo Báo Giá 2026 (Huy Phong Wine)
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Country filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-700 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#b30000]" />
              Xuất xứ:
            </span>
            {countryFilters.map((c) => (
              <button
                key={c.val}
                onClick={() => setSelectedCountry(c.val)}
                className={`text-xs px-3 py-1.5 rounded-full transition font-medium ${selectedCountry === c.val
                    ? "bg-[#b30000] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Wine type & Sort dropdowns */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative">
              <select
                value={selectedWineType}
                onChange={(e) => setSelectedWineType(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b30000] appearance-none cursor-pointer"
              >
                {wineTypeFilters.map((t) => (
                  <option key={t.val} value={t.val}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-[#b30000] appearance-none cursor-pointer"
              >
                <option value="featured">Sắp xếp: Nổi bật nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="discount">Chiết khấu cao nhất</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {(selectedCountry !== "all" || selectedWineType !== "all" || searchQuery) && (
              <button
                onClick={resetFilters}
                className="p-2 text-gray-400 hover:text-[#b30000] transition"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 5-Column Grid on Desktop - Ruoutot exact grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto space-y-4">
            <p className="text-sm text-gray-600">
              Không tìm thấy dòng vang nào phù hợp với bộ lọc đã chọn.
            </p>
            <button
              onClick={resetFilters}
              className="bg-[#b30000] text-white font-bold px-6 py-2 rounded-full text-xs uppercase"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </section>

      {/* 4. SECTION: Khám phá theo vùng (Vang Ý, Vang Pháp, Vang Chile) */}
      <section className="max-w-7xl mx-auto px-4 pt-10 space-y-6">
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
              <button onClick={() => setSelectedRegion("Abruzzo")} className="hover:underline">Abruzzo</button>
              <button onClick={() => setSelectedRegion("Puglia")} className="hover:underline">Puglia</button>
              <button onClick={() => setSelectedRegion("Tuscany")} className="hover:underline">Tuscany</button>
              <button onClick={() => setSelectedRegion("Sicily")} className="hover:underline">Sicily</button>
              <button onClick={() => setSelectedRegion("Veneto")} className="hover:underline">Veneto</button>
              <button onClick={() => setSelectedRegion("Valpolicella")} className="hover:underline">Valpolicella</button>
            </div>

            <button
              onClick={() => setSelectedCountry("Ý")}
              className="border border-white/60 hover:bg-white hover:text-[#d0532b] text-white font-bold px-8 py-2 rounded-full text-xs uppercase tracking-wider transition"
            >
              Xem thêm
            </button>
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

        {/* Region 2: RƯỢU VANG PHÁP */}
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
              <button onClick={() => setSelectedRegion("Bordeaux")} className="hover:text-white">Bordeaux</button>
              <button onClick={() => setSelectedRegion("Burgundy")} className="hover:text-white">Burgundy</button>
              <button onClick={() => setSelectedRegion("Champagne")} className="hover:text-white">Champagne</button>
              <button onClick={() => setSelectedRegion("Margaux")} className="hover:text-white">Margaux</button>
              <button onClick={() => setSelectedRegion("Languedoc")} className="hover:text-white">Languedoc</button>
              <button onClick={() => setSelectedRegion("Alsace")} className="hover:text-white">Alsace</button>
            </div>

            <button
              onClick={() => setSelectedCountry("Pháp")}
              className="border border-white/60 hover:bg-white hover:text-[#1c1512] text-white font-bold px-8 py-2 rounded-full text-xs uppercase tracking-wider transition"
            >
              Xem thêm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProductCatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400">Đang tải danh mục rượu vang...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}

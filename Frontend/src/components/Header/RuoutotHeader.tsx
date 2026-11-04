"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/siteConfig";
import { productsData, WineProduct } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import {
  Phone,
  Home,
  User,
  Search,
  Menu,
  FileText,
  Gift,
  Truck,
  Headphones,
  ShieldCheck,
} from "lucide-react";

export default function RuoutotHeader({ onToggleMobileMenu }: { onToggleMobileMenu: () => void }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WineProduct[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const filtered = productsData
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.grapes.some((g) => g.toLowerCase().includes(q))
      )
      .slice(0, 6);
    setSearchResults(filtered);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full z-[70] shadow-sm sticky top-0 md:relative">
      {/* 1. Top Light Gray Bar (Utility + Logo + Search) - exact ruoutot.net style */}
      <div className="bg-[#eaeaea] border-b border-gray-300 relative">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center relative h-14 md:h-[84px]">
          {/* Left: Mobile Menu Button & Desktop Utility Links */}
          <div className="flex-1 flex items-center justify-start">
            <button
              onClick={onToggleMobileMenu}
              aria-label="menu"
              className="md:hidden text-2xl p-2 text-gray-700 hover:text-[#b30000]"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Utility Links with Red Circle Outline Icons */}
            <div className="hidden md:flex space-x-6 text-[13px] font-bold text-gray-800">
              <Link
                href="/lien-he"
                className="hover:text-[#b30000] flex items-center group transition"
              >
                <span className="w-6 h-6 rounded-full border border-[#b30000] flex items-center justify-center mr-1.5 group-hover:bg-[#b30000] group-hover:text-white transition">
                  <Home className="w-3 h-3 text-[#b30000] group-hover:text-white" />
                </span>
                Về chúng tôi
              </Link>

              <Link
                href="/lien-he"
                className="hover:text-[#b30000] flex items-center group transition"
              >
                <span className="w-6 h-6 rounded-full border border-[#b30000] flex items-center justify-center mr-1.5 group-hover:bg-[#b30000] group-hover:text-white transition">
                  <Phone className="w-3 h-3 text-[#b30000] group-hover:text-white" />
                </span>
                Liên hệ
              </Link>

              <Link
                href="/lien-he"
                className="hover:text-[#b30000] flex items-center group transition"
              >
                <span className="w-6 h-6 rounded-full border border-[#b30000] flex items-center justify-center mr-1.5 group-hover:bg-[#b30000] group-hover:text-white transition">
                  <User className="w-3 h-3 text-[#b30000] group-hover:text-white" />
                </span>
                Dịch vụ khách hàng
              </Link>

              <Link
                href="/admin"
                className="hover:text-[#b30000] flex items-center group transition font-extrabold text-[#b30000]"
              >
                <span className="w-6 h-6 rounded-full border border-[#b30000] bg-red-100 flex items-center justify-center mr-1.5 group-hover:bg-[#b30000] group-hover:text-white transition">
                  <ShieldCheck className="w-3 h-3 text-[#b30000] group-hover:text-white" />
                </span>
                Quản trị Admin
              </Link>
            </div>
          </div>

          {/* Center: Official RƯỢU TỐT Logo */}
          <div className="flex-shrink-0 z-10 text-center">
            <Link href="/" className="block group">
              <div className="flex items-center space-x-3 justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#b30000] to-[#800000] rounded-lg shadow flex items-center justify-center text-white font-serif font-black text-2xl md:text-3xl">
                  R
                </div>
                <div className="text-left">
                  <div className="font-serif font-black text-xl md:text-2xl text-[#b30000] tracking-tight leading-none group-hover:opacity-90 transition">
                    RƯỢU TỐT
                  </div>
                  <div className="text-[10px] md:text-[11px] font-medium text-gray-600 tracking-normal mt-0.5">
                    Rượu ngon dành cho người sành
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Rounded Search Bar */}
          <div className="flex-1 flex justify-end items-center relative z-20">
            <div ref={searchRef} className="hidden md:flex relative w-full max-w-[340px] z-30">
              <form
                onSubmit={handleSearchSubmit}
                className="relative rounded-full overflow-hidden bg-white h-10 w-full shadow-sm border border-gray-300"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Nhập từ khóa cần tìm..."
                  className="w-full h-full bg-transparent pl-5 pr-12 text-[13px] focus:outline-none text-gray-700 placeholder-gray-400"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  aria-label="search"
                  className="absolute p-3 right-0 top-0 bottom-0 text-[#b30000] text-lg flex items-center justify-center hover:scale-110 transition"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 right-0 w-[380px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[380px] overflow-y-auto">
                  <div className="p-2.5 bg-gray-50 border-b text-[11px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                    <span>Sản phẩm gợi ý ({searchResults.length})</span>
                    <span className="text-[#b30000]">Xem tất cả</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/san-pham/${product.slug}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                      >
                        <div className="w-10 h-12 bg-white rounded border flex-shrink-0 flex items-center justify-center p-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 hover:text-[#b30000] truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {product.country} • {product.alcohol}
                          </p>
                        </div>
                        <div className="text-xs font-bold text-[#b30000] flex-shrink-0">
                          {formatPrice(product.price)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hotline number on top right */}
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-gray-300">
              <a
                href={`tel:${siteConfig.hotline}`}
                className="flex items-center space-x-1.5 text-[#b30000] font-bold text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-[#b30000] text-white flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 leading-none">Hotline tư vấn</div>
                  <div className="text-sm text-[#b30000] font-extrabold leading-tight">
                    {siteConfig.hotlineDisplay}
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Red Navigation Bar - exact ruoutot.net style: bg-[#b30000] */}
      <nav className="bg-[#b30000] hidden md:block sticky top-0 z-[60] w-full shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-stretch text-white text-[12px] font-semibold tracking-wider uppercase space-x-6">
            <Link
              href="/"
              className="flex items-center py-3.5 hover:text-[#f9d776] transition"
            >
              Trang chủ
            </Link>

            <Link
              href="/san-pham?quoc-gia=Chile"
              className="flex items-center py-3.5 hover:text-[#f9d776] transition relative group"
            >
              <span>Vang Chile</span>
              <span className="ml-1 text-[9px] bg-[#f9d776] text-[#b30000] px-1 rounded font-black">
                HOT
              </span>
            </Link>

            <Link
              href="/san-pham?quoc-gia=Ý"
              className="flex items-center py-3.5 hover:text-[#f9d776] transition"
            >
              Rượu Vang Ý
            </Link>

            <Link
              href="/san-pham?quoc-gia=Pháp"
              className="flex items-center py-3.5 hover:text-[#f9d776] transition"
            >
              Rượu Vang Pháp
            </Link>

            <Link
              href="/san-pham?loai-vang=Champagne"
              className="flex items-center py-3.5 hover:text-[#f9d776] transition"
            >
              Champagne & Vang Sủi
            </Link>

            <Link
              href="/san-pham?loai-vang=Không Cồn"
              className="flex items-center py-3.5 hover:text-[#f9d776] transition"
            >
              Vang 0.0% & Cocktail
            </Link>

            <Link
              href="/bao-gia-2026"
              className="flex items-center py-3.5 text-[#f9d776] font-bold hover:underline transition"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Báo Giá 2026 (PDF)
            </Link>

            <Link
              href="/kien-thuc-ruou-vang"
              className="flex items-center py-3.5 hover:text-[#f9d776] transition"
            >
              Cẩm Nang Vang
            </Link>

            <Link
              href="/lien-he"
              className="flex items-center py-3.5 hover:text-[#f9d776] transition"
            >
              Hệ Thống Cửa Hàng
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. Sub-Value Bar - exact ruoutot.net proposition strip */}
      <div className="bg-[#f8f8f8] border-b border-gray-200 hidden md:block py-2 text-xs text-gray-700">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[11px] font-semibold text-gray-600">
          <div className="flex items-center gap-1.5 hover:text-[#b30000] cursor-pointer transition">
            <Gift className="w-3.5 h-3.5 text-[#b30000]" />
            <span>Quà tặng doanh nghiệp</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-[#b30000] cursor-pointer transition">
            <Gift className="w-3.5 h-3.5 text-[#b30000]" />
            <span>Quà tặng cá nhân</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-[#b30000] cursor-pointer transition">
            <Truck className="w-3.5 h-3.5 text-[#b30000]" />
            <span>Giao hàng và đổi trả</span>
          </div>

          <a
            href={`tel:${siteConfig.hotline}`}
            className="flex items-center gap-1.5 hover:text-[#b30000] transition"
          >
            <Headphones className="w-3.5 h-3.5 text-[#b30000]" />
            <span>Liên hệ đội ngũ tư vấn ({siteConfig.hotlineDisplay})</span>
          </a>
        </div>
      </div>
    </header>
  );
}

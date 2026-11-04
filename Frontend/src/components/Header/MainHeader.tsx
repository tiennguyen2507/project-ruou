"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/siteConfig";
import { WineProduct } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  ShoppingBag,
  Heart,
  PhoneCall,
  Menu,
  X,
  Sparkles,
  Flame,
} from "lucide-react";

interface MainHeaderProps {
  onToggleMobileMenu: () => void;
}

export default function MainHeader({ onToggleMobileMenu }: MainHeaderProps) {
  const router = useRouter();
  const { totalItems, totalPrice, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WineProduct[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      fetch(`${apiUrl}/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && json.data) {
            setSearchResults(json.data);
          }
        })
        .catch(() => { });
    }, 200);

    return () => clearTimeout(timer);
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
    <div className="bg-[#8b0000] text-white py-3 px-4 shadow-md sticky top-0 z-40 border-b border-[#a51d2d]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-white hover:text-[#f9d776] transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-full bg-[#f9d776] text-[#8b0000] flex items-center justify-center font-serif font-black text-xl shadow-inner border border-[#fef3c7] group-hover:scale-105 transition">
            HP
          </div>
          <div>
            <div className="font-serif font-extrabold text-xl sm:text-2xl tracking-wide text-white flex items-center">
              <span>VANG HUY PHONG</span>
            </div>
            <div className="text-[10px] sm:text-xs text-[#f9d776] tracking-wider font-medium uppercase">
              Rượu Vang Nhập Khẩu Chính Hãng
            </div>
          </div>
        </Link>

        {/* Search Bar with Autocomplete */}
        <div ref={searchRef} className="flex-1 max-w-xl mx-2 hidden sm:block relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tìm vang Chile Carmenere, vang Pháp, Ý, Bordeaux, 0.0%..."
              className="w-full bg-white text-gray-800 placeholder-gray-400 pl-4 pr-12 py-2.5 rounded-full text-sm font-medium border-2 border-[#f9d776] focus:outline-none focus:ring-2 focus:ring-[#f9d776] shadow-sm transition"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-[#721515] hover:bg-[#500c0c] text-white rounded-full flex items-center justify-center transition"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4 text-[#f9d776]" />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 text-gray-800">
              <div className="p-2 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                <span>Gợi ý sản phẩm phù hợp ({searchResults.length})</span>
                <span className="text-[#8b0000]">Xem tất cả</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/san-pham/${product.slug}`}
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-3 p-3 hover:bg-[#fdf2f2] transition group"
                  >
                    <div className="w-10 h-14 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#8b0000] truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">
                          {product.country}
                        </span>
                        <span>{product.alcohol}</span>
                        <span className="text-gray-400">•</span>
                        <span>{product.region}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-[#8b0000]">
                        {formatPrice(product.price)}
                      </p>
                      {product.originalPrice > product.price && (
                        <p className="text-[10px] text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Hotline, Wishlist, Cart */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Hotline Box */}
          <a
            href={`tel:${siteConfig.hotline}`}
            className="hidden xl:flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition border border-white/20"
          >
            <div className="w-8 h-8 rounded-full bg-[#f9d776] flex items-center justify-center text-[#8b0000]">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-white/80 leading-none">Tư Vấn Miễn Phí</div>
              <div className="text-sm font-bold text-[#f9d776] leading-tight">
                {siteConfig.hotlineDisplay}
              </div>
            </div>
          </a>

          {/* Wishlist */}
          <Link
            href="/yeu-thich"
            className="relative p-2 text-white hover:text-[#f9d776] transition flex items-center"
            title="Sản phẩm yêu thích"
          >
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#f9d776] text-[#8b0000] text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="flex items-center space-x-2 bg-[#f9d776] hover:bg-[#fde68a] text-[#8b0000] px-3 sm:px-4 py-2 rounded-full font-bold shadow-md transition group"
            aria-label="Giỏ hàng"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-[#8b0000]" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-[#8b0000] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-xs font-bold uppercase tracking-tight">
              Giỏ Hàng
            </span>
            {totalPrice > 0 && (
              <span className="hidden lg:inline text-xs font-extrabold border-l border-[#8b0000]/30 pl-2">
                {formatPrice(totalPrice)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="sm:hidden mt-2 pt-2 border-t border-white/10">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm rượu vang theo tên, quốc gia..."
            className="w-full bg-white text-gray-800 placeholder-gray-400 pl-3 pr-10 py-2 rounded-full text-xs font-medium border border-[#f9d776] focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#721515] text-white rounded-full flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5 text-[#f9d776]" />
          </button>
        </form>
      </div>
    </div>
  );
}


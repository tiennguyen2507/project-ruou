"use client";

import React, { useState } from "react";
import Link from "next/link";
import { countryCategories, wineTypeCategories } from "@/data/categories";
import { ChevronDown, Wine, Sparkles, FileText, Gift, Award, BookOpen, Layers } from "lucide-react";

export default function MegaMenu() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <nav className="bg-[#6b0808] text-white border-b border-[#8b1414] hidden lg:block relative z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 text-xs font-semibold tracking-wide uppercase">
        {/* All Categories Dropdown button */}
        <div
          className="relative group"
          onMouseEnter={() => setActiveDropdown("categories")}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <button className="flex items-center space-x-2 bg-[#4a0606] px-5 py-3 text-[#f9d776] hover:bg-[#380404] transition">
            <Layers className="w-4 h-4" />
            <span className="font-bold">DANH MỤC RƯỢU VANG</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Mega Dropdown Panel */}
          {activeDropdown === "categories" && (
            <div className="absolute left-0 top-full w-[800px] bg-white text-gray-800 shadow-2xl rounded-b-xl border border-gray-200 p-6 grid grid-cols-3 gap-6 z-50">
              <div>
                <h4 className="text-xs font-bold text-[#8b0000] border-b pb-2 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <Wine className="w-4 h-4 text-[#8b0000]" />
                  Theo Quốc Gia
                </h4>
                <ul className="space-y-2 text-xs normal-case">
                  {countryCategories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/san-pham?quoc-gia=${encodeURIComponent(c.country)}`}
                        className="flex items-center justify-between text-gray-700 hover:text-[#8b0000] hover:font-bold transition py-1"
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {c.regions.slice(0, 2).join(", ")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#8b0000] border-b pb-2 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#8b0000]" />
                  Chủng Loại Rượu
                </h4>
                <ul className="space-y-2 text-xs normal-case">
                  {wineTypeCategories.map((w) => (
                    <li key={w.id}>
                      <Link
                        href={`/san-pham?loai-vang=${encodeURIComponent(w.name.replace("Rượu ", ""))}`}
                        className="flex items-center justify-between text-gray-700 hover:text-[#8b0000] hover:font-bold transition py-1"
                      >
                        <span>{w.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: w.color }}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#fdf8f8] p-4 rounded-lg border border-[#f5d0d0]">
                <h4 className="text-xs font-bold text-[#8b0000] mb-2 uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#8b0000]" />
                  Dòng Vang Nổi Bật 2026
                </h4>
                <p className="text-[11px] text-gray-600 mb-3 normal-case leading-relaxed">
                  Trải nghiệm tuyệt phẩm vang Chile Carmenere Santa Carolina, các dòng Icon Wine LEYENDA, OSSA và Champagne Grand Cru chuẩn quốc tế.
                </p>
                <Link
                  href="/san-pham/ruou-vang-chile-reserva-de-familia-carmenere"
                  className="inline-block bg-[#8b0000] hover:bg-[#720b18] text-white text-[11px] font-bold px-3 py-1.5 rounded transition shadow-sm uppercase tracking-wider"
                >
                  Khám phá Carmenere →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Navigation Links */}
        <div className="flex items-center space-x-1">
          <Link
            href="/"
            className="px-3 py-3 text-white/90 hover:text-[#f9d776] hover:bg-black/10 transition"
          >
            Trang Chủ
          </Link>

          <Link
            href="/san-pham?quoc-gia=Chile"
            className="px-3 py-3 text-white/90 hover:text-[#f9d776] hover:bg-black/10 transition flex items-center gap-1"
          >
            <span>Vang Chile</span>
            <span className="text-[10px] bg-[#d4af37] text-[#8b0000] px-1 py-0.2 rounded font-extrabold lowercase">
              hot
            </span>
          </Link>

          <Link
            href="/san-pham?quoc-gia=Ý"
            className="px-3 py-3 text-white/90 hover:text-[#f9d776] hover:bg-black/10 transition"
          >
            Vang Ý
          </Link>

          <Link
            href="/san-pham?quoc-gia=Pháp"
            className="px-3 py-3 text-white/90 hover:text-[#f9d776] hover:bg-black/10 transition"
          >
            Vang Pháp
          </Link>

          <Link
            href="/san-pham?loai-vang=Champagne"
            className="px-3 py-3 text-white/90 hover:text-[#f9d776] hover:bg-black/10 transition"
          >
            Champagne & Sủi
          </Link>

          <Link
            href="/san-pham?loai-vang=Không Cồn"
            className="px-3 py-3 text-white/90 hover:text-[#f9d776] hover:bg-black/10 transition"
          >
            Vang 0.0%
          </Link>

          <Link
            href="/bao-gia-2026"
            className="px-3 py-3 text-[#f9d776] hover:text-white bg-[#8b0000] hover:bg-[#500c0c] transition font-bold flex items-center gap-1 border-x border-[#8b1414]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>BẢNG GIÁ 2026</span>
          </Link>

          <Link
            href="/kien-thuc-ruou-vang"
            className="px-3 py-3 text-white/90 hover:text-[#f9d776] hover:bg-black/10 transition flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kiến Thức Vang</span>
          </Link>

          <Link
            href="/lien-he"
            className="px-3 py-3 text-white/90 hover:text-[#f9d776] hover:bg-black/10 transition"
          >
            Showroom
          </Link>
        </div>
      </div>
    </nav>
  );
}


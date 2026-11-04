"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";
import { countryCategories, wineTypeCategories } from "@/data/categories";
import { X, Phone, FileText, ChevronRight, Wine, ShieldCheck, MapPin } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-[#8b0000] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#f9d776] text-[#8b0000] flex items-center justify-center font-bold text-sm">
              HP
            </div>
            <div>
              <div className="font-serif font-black text-sm tracking-wide">VANG HUY PHONG</div>
              <div className="text-[10px] text-[#f9d776]">Hotline: {siteConfig.hotlineDisplay}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full bg-white/10"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 p-4 space-y-4 text-sm">
          {/* Highlight Báo Giá */}
          <Link
            href="/bao-gia-2026"
            onClick={onClose}
            className="flex items-center justify-between bg-[#fdf2f2] text-[#8b0000] p-3 rounded-lg font-bold border border-[#f8b4b4]"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#8b0000]" />
              <span>BẢNG BÁO GIÁ 2026 (PDF)</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Rượu Vang Theo Quốc Gia
            </h4>
            <div className="space-y-1">
              {countryCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/san-pham?quoc-gia=${encodeURIComponent(c.country)}`}
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-3 text-gray-800 hover:bg-gray-100 rounded transition font-medium text-xs"
                >
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Chủng Loại Vang
            </h4>
            <div className="space-y-1">
              {wineTypeCategories.map((w) => (
                <Link
                  key={w.id}
                  href={`/san-pham?loai-vang=${encodeURIComponent(w.name.replace("Rượu ", ""))}`}
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-3 text-gray-800 hover:bg-gray-100 rounded transition font-medium text-xs"
                >
                  <span>{w.name}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: w.color }}
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t pt-3 space-y-1">
            <Link
              href="/kien-thuc-ruou-vang"
              onClick={onClose}
              className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded text-xs font-medium"
            >
              Cẩm Nang & Kiến Thức Vang
            </Link>
            <Link
              href="/lien-he"
              onClick={onClose}
              className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded text-xs font-medium"
            >
              Hệ Thống Showroom & Bản Đồ
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t text-xs text-gray-600">
          <div className="flex items-center space-x-2 text-[#8b0000] font-bold mb-1">
            <Phone className="w-4 h-4" />
            <span>Hotline: {siteConfig.hotlineDisplay}</span>
          </div>
          <p className="text-[11px] text-gray-500">
            58B Võ Văn Dũng, P. Ô Chợ Dừa, Q. Đống Đa, Hà Nội
          </p>
        </div>
      </div>
    </div>
  );
}


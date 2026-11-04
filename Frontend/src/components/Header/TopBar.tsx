"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";
import { Phone, Mail, MapPin, Clock, FileText, ShieldCheck } from "lucide-react";

export default function TopBar() {
  return (
    <div className="bg-[#4a0c0c] text-[#f9d776] text-xs py-1.5 px-4 border-b border-[#721515]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Left: Commitments & Promotion */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-white/90">
            <ShieldCheck className="w-3.5 h-3.5 text-[#f9d776]" />
            <span>100% Rượu Vang Nhập Khẩu Chính Ngạch Đầy Đủ CO/CQ</span>
          </div>
          <span className="hidden lg:inline text-white/40">|</span>
          <div className="hidden lg:flex items-center space-x-1.5 text-white/80">
            <Clock className="w-3.5 h-3.5 text-[#f9d776]" />
            <span>{siteConfig.workingHours}</span>
          </div>
        </div>

        {/* Right: Contact & Quick Links */}
        <div className="flex items-center space-x-4">
          <Link
            href="/bao-gia-2026"
            className="flex items-center space-x-1 text-[#f9d776] hover:text-white font-medium bg-[#721515] px-2.5 py-0.5 rounded transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Báo Giá 2026 (PDF)</span>
          </Link>
          <a
            href={`tel:${siteConfig.hotline}`}
            className="flex items-center space-x-1 text-white hover:text-[#f9d776] transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#f9d776]" />
            <span className="font-semibold">{siteConfig.hotlineDisplay}</span>
          </a>
          <span className="hidden sm:inline text-white/40">|</span>
          <Link
            href="/lien-he"
            className="hidden sm:flex items-center space-x-1 text-white/80 hover:text-white transition"
          >
            <MapPin className="w-3.5 h-3.5 text-[#f9d776]" />
            <span>Hệ Thống Showroom</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


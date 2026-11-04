"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/siteConfig";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Building,
  FileText,
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide customer footer on admin portal
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#dfdfdf] text-gray-800 pt-10 pb-8 border-t-2 border-gray-300 relative overflow-hidden">
      {/* Giant R background Watermark like Ruoutot */}
      <div className="absolute -left-10 top-0 opacity-[0.04] pointer-events-none text-[600px] leading-none font-serif text-black z-0 select-none">
        R
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 pb-8 border-b border-gray-300">
          {/* Col 1: Thông tin chủ quản */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#b30000] text-white flex items-center justify-center font-bold text-sm">
                HP
              </div>
              <span className="font-serif font-black text-lg text-[#b30000]">
                RƯỢU TỐT — VANG HUY PHONG
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <span className="bg-[#b30000] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                18+
              </span>
              <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                Không lái xe
              </span>
              <span className="bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                Chính hãng
              </span>
            </div>

            <h4 className="font-bold text-[#b30000] text-xs uppercase tracking-wide">
              Thông Tin Chủ Quản
            </h4>

            <div className="text-[12px] space-y-1.5 leading-relaxed text-gray-700">
              <p className="font-bold text-gray-900">{siteConfig.companyName}</p>
              <p>Mã số thuế: <strong>{siteConfig.taxCode}</strong> do Sở KH & ĐT cấp</p>
              <p>{siteConfig.licenseNumber}</p>
              <p>Địa chỉ: {siteConfig.address}</p>
              <p>
                Hotline tư vấn:{" "}
                <strong className="text-[#b30000] text-sm">
                  {siteConfig.hotlineDisplay}
                </strong>
              </p>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-[#b30000] font-bold hover:underline"
                >
                  {siteConfig.email}
                </a>
              </p>
            </div>
          </div>

          {/* Col 2: Hệ thống Showroom Hà Nội */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#b30000] text-xs uppercase tracking-wide border-b border-gray-300 pb-1.5">
              Showroom Hà Nội
            </h4>
            <div className="text-[12px] space-y-2 text-gray-700">
              <div className="bg-white/60 p-2.5 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-900">Showroom Đống Đa (Trụ sở chính)</p>
                <p className="text-gray-600 text-[11px] mt-0.5">58B Phố Võ Văn Dũng, Phường Ô Chợ Dừa, Đống Đa</p>
                <p className="text-[11px] text-[#b30000] font-bold mt-1">Hotline: {siteConfig.hotlineDisplay}</p>
              </div>

              <div className="bg-white/60 p-2.5 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-900">Showroom Ba Đình</p>
                <p className="text-gray-600 text-[11px] mt-0.5">247 Hoàng Hoa Thám, Ba Đình, Hà Nội</p>
                <p className="text-[11px] text-[#b30000] font-bold mt-1">Hotline: {siteConfig.hotlineDisplay}</p>
              </div>
            </div>
          </div>

          {/* Col 3: Showroom TP.HCM & Miền Nam */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#b30000] text-xs uppercase tracking-wide border-b border-gray-300 pb-1.5">
              Showroom TP. Hồ Chí Minh
            </h4>
            <div className="text-[12px] space-y-2 text-gray-700">
              <div className="bg-white/60 p-2.5 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-900">Chi Nhánh Gò Vấp</p>
                <p className="text-gray-600 text-[11px] mt-0.5">125/46 Lê Đức Thọ, Phường 17, Quận Gò Vấp, TP.HCM</p>
                <p className="text-[11px] text-[#b30000] font-bold mt-1">Hotline: 093.882.6886</p>
              </div>

              <div className="bg-white/60 p-2.5 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-900">Giao Hàng Miền Nam</p>
                <p className="text-gray-600 text-[11px] mt-0.5">Giao hỏa tốc 2 giờ tại tất cả các quận nội thành TP.HCM</p>
              </div>
            </div>
          </div>

          {/* Col 4: Báo giá 2026 & Hỗ trợ */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#b30000] text-xs uppercase tracking-wide border-b border-gray-300 pb-1.5">
              Báo Giá & Dịch Vụ
            </h4>
            <ul className="text-[12px] space-y-1.5 text-gray-700">
              <li>
                <Link
                  href="/bao-gia-2026"
                  className="text-[#b30000] font-bold hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tra cứu Bảng báo giá 2026 (PDF)</span>
                </Link>
              </li>
              <li>
                <Link href="/san-pham/ruou-vang-chile-reserva-de-familia-carmenere" className="hover:text-[#b30000] transition">
                  Vang Chile Santa Carolina Carmenere
                </Link>
              </li>
              <li>
                <Link href="/san-pham?quoc-gia=Ý" className="hover:text-[#b30000] transition">
                  Bộ sưu tập Rượu Vang Ý
                </Link>
              </li>
              <li>
                <Link href="/san-pham?quoc-gia=Pháp" className="hover:text-[#b30000] transition">
                  Bộ sưu tập Vang Pháp & Champagne
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-giao-hang" className="hover:text-[#b30000] transition">
                  Chính sách giao hàng hỏa tốc 2h
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="hover:text-[#b30000] transition">
                  Chính sách đổi trả trong 7 ngày
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Health Warning Banner */}
        <div className="bg-white p-4 rounded-xl border border-gray-300 text-xs text-gray-700 leading-relaxed">
          <p className="font-bold text-[#b30000] mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#b30000]" />
            CẢNH BÁO PHÁP LÝ THEO NGHỊ ĐỊNH 24/2020/NĐ-CP:
          </p>
          <p className="text-[11px] text-gray-600">
            {siteConfig.legalWarning}
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-2">
          <p>© 2026 {siteConfig.companyName}. Bản quyền thuộc về Rượu Tốt - Vang Huy Phong.</p>
          <p>Phiên bản giá 17082026 — Có giá trị hiệu lực đến 31/03/2027.</p>
        </div>
      </div>
    </footer>
  );
}

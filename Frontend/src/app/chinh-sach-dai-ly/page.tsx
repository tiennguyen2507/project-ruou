"use client";

import React from "react";
import Link from "next/link";
import { Award, BadgePercent, Building, PhoneCall, ArrowLeft, FileText } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function AgencyPolicyPage() {
  return (
    <div className="bg-[#fbfbfb] py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#8b0000] font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <span className="text-xs font-bold text-[#8b0000] bg-red-50 px-3 py-1 rounded-full uppercase">
              Hợp Tác Phân Phối
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-2">
              Chính Sách Chiết Khấu Đại Lý & Quà Tết 2026
            </h1>
          </div>

          <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
            <h3 className="font-bold text-sm text-gray-900 uppercase">1. Quyền Lợi Dành Cho Đại Lý & Doanh Nghiệp</h3>
            <p>
              • Chiết khấu lũy tiến từ <strong>15% đến 25%</strong> dựa trên tổng giá trị đơn hàng theo Báo Giá 2026 chính thức.
            </p>
            <p>
              • Đầy đủ hóa đơn Giá trị gia tăng (VAT 10%) và chứng từ hải quan hợp lệ để quyết toán chi phí công ty.
            </p>
            <p>
              • Hỗ trợ thiết kế hộp quà, in logo doanh nghiệp lên hộp gỗ và túi xách sang trọng hoàn toàn miễn phí cho đơn hàng từ 20 set trở lên.
            </p>

            <h3 className="font-bold text-sm text-gray-900 uppercase pt-2">2. Hỗ Trợ Đào Tạo & Thử Nếm</h3>
            <p>
              Chuyên gia Sommelier của Huy Phong hỗ trợ đào tạo nhân viên phục vụ rượu vang cho các nhà hàng, khách sạn và tổ chức các buổi thử nếm (Wine Tasting) trực tiếp tại showroom hoặc tại trụ sở doanh nghiệp.
            </p>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div>
                <p className="font-bold text-amber-950 text-sm">Liên hệ Phòng Kinh Doanh & Đại Lý:</p>
                <p className="text-amber-900 text-xs mt-0.5">Hotline: <strong>{siteConfig.hotlineDisplay}</strong> | Email: <strong>{siteConfig.email}</strong></p>
              </div>
              <Link
                href="/bao-gia-2026"
                className="bg-[#8b0000] text-white font-bold py-2 px-4 rounded-lg text-xs uppercase whitespace-nowrap"
              >
                Tải Báo Giá 2026 PDF
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


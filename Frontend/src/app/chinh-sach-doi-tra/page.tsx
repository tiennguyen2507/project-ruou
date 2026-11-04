"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw, ShieldCheck, CheckCircle, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function ReturnPolicyPage() {
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
              Bảo Hành & Đổi Trả
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-2">
              Chính Sách Đổi Trả Trong 7 Ngày
            </h1>
          </div>

          <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
            <h3 className="font-bold text-sm text-gray-900 uppercase">1. Điều Kiện Được Đổi Trả</h3>
            <p>
              • Chai rượu vang bị lỗi nắp bấc (Cork taint) khiến rượu có mùi ẩm mốc hoặc chua giấm do oxy hóa ngoài ý muốn.
            </p>
            <p>
              • Sản phẩm bị rạn nứt hoặc rò rỉ trong quá trình vận chuyển.
            </p>
            <p>
              • Giao không đúng dòng vang, niên vụ hoặc thương hiệu mà quý khách đã đặt mua.
            </p>

            <h3 className="font-bold text-sm text-gray-900 uppercase pt-2">2. Thời Gian Áp Dụng</h3>
            <p>
              Trong vòng <strong>7 ngày</strong> kể từ khi quý khách nhận được hàng từ nhân viên giao vận.
            </p>

            <h3 className="font-bold text-sm text-gray-900 uppercase pt-2">3. Cam Kết Đền Bù Hàng Giả</h3>
            <p className="bg-red-50 p-3 rounded-xl border border-red-200 text-[#8b0000] font-bold">
              Công ty Cổ phần Huy Phong cam kết đền bù gấp 10 lần (1000%) giá trị đơn hàng nếu bất kỳ sản phẩm nào phát hiện là hàng giả, hàng nhái hoặc hàng không rõ nguồn gốc.
            </p>

            <p className="pt-2">
              Hotline giải quyết khiếu nại & đổi trả: <strong>{siteConfig.hotlineDisplay}</strong> (8:00 - 22:00 hàng ngày).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


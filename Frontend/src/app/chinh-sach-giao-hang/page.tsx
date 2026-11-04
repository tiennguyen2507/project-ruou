"use client";

import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Clock, MapPin, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

export default function ShippingPolicyPage() {
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
              Chính Sách Vận Chuyển
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-2">
              Chính Sách Giao Hàng Siêu Tốc 2 Giờ
            </h1>
          </div>

          <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
            <h3 className="font-bold text-sm text-gray-900 uppercase">1. Phạm Vi & Thời Gian Giao Hàng</h3>
            <p>
              • <strong>Khu vực Nội thành Hà Nội & TP. Hồ Chí Minh:</strong> Giao hàng hỏa tốc trong vòng <strong>2 giờ</strong> kể từ khi xác nhận đơn hàng qua điện thoại.
            </p>
            <p>
              • <strong>Các tỉnh thành khác trên toàn quốc:</strong> Giao hàng qua đơn vị chuyển phát nhanh chuyên biệt về đồ uống thủy tinh dễ vỡ từ 24 - 48 giờ.
            </p>

            <h3 className="font-bold text-sm text-gray-900 uppercase pt-2">2. Cước Phí Vận Chuyển</h3>
            <p>
              • <strong>MIỄN PHÍ VẬN CHUYỂN (Freeship)</strong> cho tất cả đơn hàng từ <strong>1.500.000 đ</strong> trở lên hoặc đơn hàng mua từ 1 thùng (6 chai) trở lên.
            </p>
            <p>
              • Đơn hàng dưới 1.500.000 đ: Áp dụng cước phí đồng giá <strong>30.000 đ</strong> cho khu vực nội thành.
            </p>

            <h3 className="font-bold text-sm text-gray-900 uppercase pt-2">3. Quy Cách Đóng Gói An Toàn</h3>
            <p>
              Toàn bộ rượu vang tại Huy Phong Wine đều được đóng gói bằng túi bọt khí chống sốc chuyên dụng, chèn xốp hoặc hộp gỗ cao cấp, đảm bảo nguyên vẹn 100% đến tay khách hàng.
            </p>

            <h3 className="font-bold text-sm text-gray-900 uppercase pt-2">4. Kiểm Tra Hàng Trước Khi Thanh Toán</h3>
            <p>
              Quý khách có quyền mở bọc kiểm tra chai rượu, tem mác hải quan và hóa đơn VAT đi kèm trước khi thanh toán tiền mặt cho nhân viên giao hàng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


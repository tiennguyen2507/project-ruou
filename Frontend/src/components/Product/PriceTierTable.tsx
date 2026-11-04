"use client";

import React from "react";
import { WineProduct } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { Tag, Phone, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

interface PriceTierTableProps {
  product: WineProduct;
}

export default function PriceTierTable({ product }: PriceTierTableProps) {
  return (
    <div className="bg-amber-50/50 rounded-xl border border-amber-200 overflow-hidden my-4">
      <div className="bg-amber-100/70 px-4 py-2 text-xs font-bold text-amber-900 flex items-center justify-between border-b border-amber-200">
        <span className="flex items-center gap-1.5 uppercase tracking-wide">
          <Tag className="w-4 h-4 text-[#8b0000]" />
          Bảng Giá Bán Lẻ & Giá Thùng (2026)
        </span>
        <span className="text-[11px] text-amber-800">Đã gồm VAT 10%</span>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-amber-200 text-gray-600 font-bold">
              <th className="pb-2">Quy cách</th>
              <th className="pb-2">Đơn giá niêm yết</th>
              <th className="pb-2">Giá ưu đãi</th>
              <th className="pb-2 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100 font-medium">
            <tr>
              <td className="py-2.5 font-bold text-gray-800">Mua lẻ (1 chai 750ml)</td>
              <td className="py-2.5 text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </td>
              <td className="py-2.5 text-[#8b0000] font-extrabold text-sm">
                {formatPrice(product.price)}
              </td>
              <td className="py-2.5 text-right text-emerald-700 font-bold">
                Có sẵn
              </td>
            </tr>
            <tr>
              <td className="py-2.5 font-bold text-gray-800">
                Thùng nguyên kiện (6 chai)
                <span className="block text-[10px] text-amber-700 font-normal">
                  (Tiết kiệm thêm 10% + Tặng kèm khui vang cao cấp)
                </span>
              </td>
              <td className="py-2.5 text-gray-400 line-through">
                {formatPrice(product.price * 6)}
              </td>
              <td className="py-2.5 text-[#8b0000] font-extrabold text-sm">
                {formatPrice(product.casePrice)}
              </td>
              <td className="py-2.5 text-right text-emerald-700 font-bold">
                Freeship 2h
              </td>
            </tr>
            <tr className="bg-amber-100/30">
              <td className="py-2.5 font-bold text-gray-800">
                Giá sỉ / Doanh nghiệp / Quà Tết
                <span className="block text-[10px] text-gray-500 font-normal">
                  (Từ 3 thùng trở lên kèm hóa đơn VAT)
                </span>
              </td>
              <td colSpan={2} className="py-2.5 text-[#8b0000] font-bold">
                Liên hệ hotline để nhận chiết khấu đại lý tốt nhất
              </td>
              <td className="py-2.5 text-right">
                <a
                  href={`tel:${siteConfig.hotline}`}
                  className="inline-flex items-center gap-1 bg-[#8b0000] text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-[#720b18] transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>{siteConfig.hotlineDisplay}</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


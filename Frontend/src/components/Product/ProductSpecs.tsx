"use client";

import React from "react";
import { WineProduct } from "@/data/products";

interface ProductSpecsProps {
  product: WineProduct;
}

export default function ProductSpecs({ product }: ProductSpecsProps) {
  const specs = [
    { label: "Xuất xứ", value: product.country },
    { label: "Vùng làm vang", value: product.region },
    { label: "Nhà sản xuất / Thương hiệu", value: product.brand },
    { label: "Giống nho", value: product.grapes.join(", ") },
    { label: "Nồng độ cồn", value: product.alcohol },
    { label: "Dung tích", value: product.volume },
    { label: "Phân hạng / Đẳng cấp", value: product.classification },
    { label: "Loại vang", value: product.wineType },
    { label: "Niên vụ (Vintage)", value: product.vintage },
    { label: "Nhiệt độ phục vụ lý tưởng", value: product.servingTemp },
    { label: "Thời gian thở (Decant)", value: product.decanting },
    { label: "Mã sản phẩm (SKU)", value: product.sku },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-[#8b0000] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
        <span>Thông Số Kỹ Thuật Chi Tiết</span>
        <span className="text-[#f9d776] text-[11px] font-normal">Chuẩn Báo Giá 2026</span>
      </div>

      <table className="w-full text-xs">
        <tbody>
          {specs.map((item, idx) => (
            <tr
              key={idx}
              className={`border-b border-gray-100 transition hover:bg-gray-50/80 ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
              }`}
            >
              <td className="py-2.5 px-4 font-semibold text-gray-600 w-2/5 border-r border-gray-100">
                {item.label}
              </td>
              <td className="py-2.5 px-4 font-medium text-gray-900">
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


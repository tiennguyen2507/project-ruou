"use client";

import React from "react";
import { ShieldCheck, Truck, RotateCcw, UserCheck, Award } from "lucide-react";

export default function ProductCommitments() {
  const list = [
    {
      icon: ShieldCheck,
      title: "Cam Kết 100% Chính Hãng",
      desc: "Đền bù 1000% giá trị đơn hàng nếu phát hiện hàng giả, hàng nhái.",
    },
    {
      icon: Truck,
      title: "Giao Hỏa Tốc Trong 2 Giờ",
      desc: "Nội thành Hà Nội & TP.HCM giao siêu tốc, đóng gói xốp chống sốc.",
    },
    {
      icon: RotateCcw,
      title: "Đổi Trả Trong 7 Ngày",
      desc: "Đổi mới lập tức nếu chai vang bị lỗi nút bấc hoặc biến chất oxy hóa.",
    },
    {
      icon: Award,
      title: "Bảo Quản Hầm Lạnh 16-18°C",
      desc: "Hệ thống kho rượu vang chuẩn quốc tế bảo toàn 100% chất lượng vang.",
    },
    {
      icon: UserCheck,
      title: "Sommelier Tư Vấn 24/7",
      desc: "Hỗ trợ chọn vang theo món ăn, khẩu vị và ngân sách của bạn.",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm my-4">
      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-2 border-b border-gray-100">
        <ShieldCheck className="w-4 h-4 text-[#8b0000]" />
        Cam Kết Dịch Vụ Vàng Từ Huy Phong
      </h4>
      <div className="space-y-3">
        {list.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-[#fdf2f2] text-[#8b0000] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none">
                  {item.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


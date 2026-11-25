"use client";

import React from "react";
import Link from "next/link";
import { Globe2, Clock } from "lucide-react";

interface DashboardHeaderProps {
  historyCount: number;
}

export function DashboardHeader({ historyCount }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Globe2 className="w-6 h-6 text-[#ea580c]" />
          <span>Proxy Seeding & Redirect Tool</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Kiểm tra IP đầu ra của proxy, vị trí địa lý và giải mã toàn bộ chuỗi URL redirect affiliate
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/proxy/history"
          className="flex items-center gap-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#ea580c] px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 transition shadow-2xs"
        >
          <Clock className="w-4 h-4 text-[#ea580c]" />
          <span>Xem Lịch Sử</span>
          <span className="bg-orange-100 text-[#ea580c] text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
            {historyCount}
          </span>
        </Link>
        <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] font-black text-xs flex items-center justify-center shadow-2xs">
          AU
        </div>
      </div>
    </div>
  );
}

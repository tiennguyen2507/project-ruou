"use client";

import React from "react";
import Link from "next/link";
import { Clock, ChevronRight, ArrowRight } from "lucide-react";
import { ProxyHistoryItem } from "@/lib/proxyHistory";

interface RecentRunsCardProps {
  history: ProxyHistoryItem[];
}

export function RecentRunsCard({ history }: RecentRunsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-[#ea580c]" />
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">
            Lịch Sử Chạy Gần Đây
          </h2>
          <span className="bg-orange-50 text-[#ea580c] font-bold text-xs px-2.5 py-0.5 rounded-full border border-orange-200/60">
            {history.length} lượt đã ghi nhận
          </span>
        </div>

        <Link
          href="/dashboard/history"
          className="flex items-center gap-1.5 text-xs font-bold text-[#ea580c] hover:text-[#c2410c] hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200/80 transition"
        >
          <span>Xem toàn bộ lịch sử</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5 most recent items preview */}
      <div className="divide-y divide-gray-100">
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            Chưa có lịch sử chạy proxy nào. Hãy thực hiện lượt chạy đầu tiên ở trên!
          </div>
        ) : (
          history.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="p-3.5 hover:bg-gray-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                    item.success ? "bg-[#ffedd5] text-[#ea580c]" : "bg-red-100 text-red-600"
                  }`}
                >
                  P
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="font-bold text-gray-900 truncate max-w-sm sm:max-w-md">
                    {item.targetUrl}
                  </div>
                  <div className="text-gray-400 text-[11px] truncate max-w-xs sm:max-w-lg font-mono">
                    ↳ {item.finalUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold px-2 py-0.5 rounded">
                  IP: {item.ip}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    item.success
                      ? "bg-[#d1fae5] text-[#059669]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  HTTP {item.status}
                </span>
                <span className="text-gray-400 text-[11px] whitespace-nowrap ml-1">
                  {item.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer View All Link */}
      {history.length > 5 && (
        <div className="p-3 bg-gray-50/60 border-t border-gray-100 text-center">
          <Link
            href="/dashboard/history"
            className="text-xs font-bold text-[#ea580c] hover:underline inline-flex items-center gap-1"
          >
            <span>Xem thêm {history.length - 5} lượt chạy khác trên trang Lịch Sử</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

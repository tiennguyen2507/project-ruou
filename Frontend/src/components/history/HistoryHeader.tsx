"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Globe2, Trash2, Play } from "lucide-react";

interface HistoryHeaderProps {
  hasHistory: boolean;
  onClearHistory: () => void;
}

export function HistoryHeader({ hasHistory, onClearHistory }: HistoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#ea580c] transition bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang Proxy</span>
          </Link>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Globe2 className="w-6 h-6 text-[#ea580c]" />
          <span>Lịch sử Chạy Proxy Seeding</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Theo dõi chi tiết các lượt request, IP đầu ra, vị trí địa lý và URL đích nhận được
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        {hasHistory && (
          <button
            onClick={onClearHistory}
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-red-200/80 px-3 py-2 rounded-xl transition shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        )}

        <Link
          href="/dashboard"
          className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Chạy lượt mới</span>
        </Link>
      </div>
    </div>
  );
}

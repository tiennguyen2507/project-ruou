"use client";

import React from "react";

interface HistoryStatsBarProps {
  totalCount: number;
  successCount: number;
  failCount: number;
}

export function HistoryStatsBar({
  totalCount,
  successCount,
  failCount,
}: HistoryStatsBarProps) {
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="text-xs font-medium text-gray-500">Tổng số lượt chạy</div>
        <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
          {totalCount}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="text-xs font-medium text-emerald-600">Thành công (Active)</div>
        <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
          {successCount}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="text-xs font-medium text-red-500">Thất bại / Lỗi</div>
        <div className="text-xl sm:text-2xl font-black text-red-600 mt-1">
          {failCount}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="text-xs font-medium text-blue-600">Tỷ lệ thành công</div>
        <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
          {successRate}%
        </div>
      </div>
    </div>
  );
}

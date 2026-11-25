"use client";

import React from "react";
import { RotateCw } from "lucide-react";

interface HistoryControlsProps {
  filteredCount: number;
  totalCount: number;
  successCount: number;
  failCount: number;
  statusFilter: "all" | "success" | "failed";
  onStatusFilterChange: (filter: "all" | "success" | "failed") => void;
  searchHistory: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
}

export function HistoryControls({
  filteredCount,
  totalCount,
  successCount,
  failCount,
  statusFilter,
  onStatusFilterChange,
  searchHistory,
  onSearchChange,
  onRefresh,
}: HistoryControlsProps) {
  return (
    <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="font-bold text-gray-900 text-base">
          Danh sách chi tiết các lần chạy
        </h2>
        <span className="bg-orange-50 text-[#ea580c] font-bold text-xs px-2.5 py-0.5 rounded-full border border-orange-200/60">
          {filteredCount} kết quả
        </span>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
          Lưu trên Backend • Tự động xóa sau 3 ngày
        </span>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 ml-1">
          <button
            type="button"
            onClick={() => onStatusFilterChange("all")}
            className={`text-xs font-semibold px-3 py-1 rounded-md transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-gray-800 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("success")}
            className={`text-xs font-semibold px-3 py-1 rounded-md transition cursor-pointer ${
              statusFilter === "success"
                ? "bg-[#059669] text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Thành công ({successCount})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("failed")}
            className={`text-xs font-semibold px-3 py-1 rounded-md transition cursor-pointer ${
              statusFilter === "failed"
                ? "bg-red-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Thất bại ({failCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-72">
          <input
            type="text"
            value={searchHistory}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm URL, UID, IP, Vị trí..."
            className="w-full pl-3 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          title="Làm mới lịch sử"
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

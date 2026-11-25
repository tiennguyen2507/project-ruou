"use client";

import React from "react";
import { Timer, Globe2, Layers, Pause, Play, Plus } from "lucide-react";

interface AutoRunCardProps {
  isAutoRunning: boolean;
  enabledTasksCount: number;
  totalTasksCount: number;
  totalRunsCount: number;
  onStopAll: () => void;
  onStartAll: () => void;
  onOpenCreate: () => void;
  children: React.ReactNode;
}

export function AutoRunCard({
  isAutoRunning,
  enabledTasksCount,
  totalTasksCount,
  totalRunsCount,
  onStopAll,
  onStartAll,
  onOpenCreate,
  children,
}: AutoRunCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
        isAutoRunning
          ? "bg-gradient-to-br from-emerald-950/5 via-white to-emerald-50/30 border-emerald-500/80 ring-2 ring-emerald-500/20"
          : "bg-white border-gray-200/80"
      }`}
    >
      {/* Card Header & Global Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isAutoRunning
                ? "bg-emerald-600 text-white animate-pulse"
                : "bg-orange-100 text-[#ea580c]"
            }`}
          >
            {isAutoRunning ? <Timer className="w-5 h-5" /> : <Globe2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                Cấu hình & Tự động chạy ngầm Backend (Auto Run 24/7)
              </h2>
              <span className="bg-orange-50 text-[#ea580c] border border-orange-200/80 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                <Layers className="w-3 h-3" />
                <span>
                  {enabledTasksCount}/{totalTasksCount} URL kích hoạt
                </span>
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAutoRunning ? "bg-emerald-500 animate-ping" : "bg-gray-300"
                }`}
              ></span>
              <span>Mỗi URL trong danh sách chạy độc lập theo bộ đếm giờ riêng</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto shrink-0">
          {/* Nút Tạm dừng tất cả */}
          {isAutoRunning && (
            <button
              type="button"
              onClick={onStopAll}
              className="flex items-center justify-center gap-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-red-200 shadow-2xs cursor-pointer"
              title="Tạm dừng toàn bộ các URL đang chạy ngầm Backend"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Tạm dừng tất cả ({totalRunsCount} lượt)</span>
            </button>
          )}

          {/* Nút Chạy tất cả */}
          {!isAutoRunning && totalTasksCount > 0 && (
            <button
              type="button"
              onClick={onStartAll}
              className="flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-emerald-200 shadow-2xs cursor-pointer"
              title="Bật chạy lại tất cả URL trong danh sách"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Bật chạy tất cả ({totalTasksCount} URL)</span>
            </button>
          )}

          {/* Nút Thêm URL */}
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs shadow-emerald-600/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm URL vào danh sách</span>
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

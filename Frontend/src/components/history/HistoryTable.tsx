"use client";

import React from "react";
import Link from "next/link";
import { Globe2, Play, Copy, Check } from "lucide-react";
import { ProxyHistoryItem } from "@/lib/proxyHistory";

interface HistoryTableProps {
  items: ProxyHistoryItem[];
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onRerun: (targetUrl: string) => void;
  formatTime: (timeStr?: string) => string;
}

export function HistoryTable({
  items,
  copiedKey,
  onCopy,
  onRerun,
  formatTime,
}: HistoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ea580c] flex items-center justify-center mx-auto">
          <Globe2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-700">Chưa có dữ liệu lịch sử chạy proxy từ Backend</p>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Toàn bộ dữ liệu được lưu trực tiếp từ Backend khi chạy ngầm và tự động xóa sau 3 ngày (72 giờ).
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs shadow-emerald-600/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Đến trang chạy Proxy</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => (
        <div
          key={item.id}
          className="p-3.5 sm:p-4 hover:bg-gray-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
        >
          {/* Left: Icon + Target & Final URL */}
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                item.success ? "bg-[#ffedd5] text-[#ea580c]" : "bg-red-100 text-red-600"
              }`}
            >
              P
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
                  {item.targetUrl}
                </span>
                <span className="bg-[#ffedd5] text-[#ea580c] font-bold text-[11px] px-1.5 py-0.2 rounded flex items-center gap-1">
                  <span>#{item.id}</span>
                  <button
                    type="button"
                    onClick={() => onCopy(item.id, `id-${item.id}`)}
                    className="hover:opacity-75 cursor-pointer"
                    title="Sao chép UID"
                  >
                    {copiedKey === `id-${item.id}` ? (
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>
                </span>

                {item.device && (
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.device}
                  </span>
                )}
              </div>

              <div className="text-gray-400 text-[11px] truncate max-w-sm sm:max-w-xl font-mono flex items-center gap-1.5">
                <span className="text-gray-400 font-sans">↳ URL cuối:</span>
                <span className="text-gray-600 truncate">{item.finalUrl}</span>
                <button
                  type="button"
                  onClick={() => onCopy(item.finalUrl, `url-${item.id}`)}
                  title="Sao chép URL cuối"
                  className="text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer"
                >
                  {copiedKey === `url-${item.id}` ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center Badges */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <span className="border border-gray-300 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded">
              SOCKS5
            </span>

            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                item.success ? "bg-[#d1fae5] text-[#059669]" : "bg-red-50 text-red-600"
              }`}
            >
              HTTP {item.status}
            </span>

            <span className="bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <span>IP: {item.ip}</span>
            </span>

            <span className="border border-gray-200 text-gray-500 text-[11px] px-2 py-0.5 rounded">
              {item.redirectType}
            </span>
          </div>

          {/* Right Details */}
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full md:w-auto shrink-0 text-gray-500">
            <div className="text-[11px] text-right">
              <div className="text-gray-600 font-medium">{item.location}</div>
              {item.affSid && (
                <div className="text-gray-400 truncate max-w-[140px] font-mono text-[10px]">
                  aff: {item.affSid.slice(0, 10)}...
                </div>
              )}
            </div>

            <div className="text-gray-400 text-[11px] whitespace-nowrap font-mono">
              {formatTime(item.timestamp)}
            </div>

            <button
              type="button"
              onClick={() => onRerun(item.targetUrl)}
              title="Chạy lại link này"
              className="p-1.5 text-gray-400 hover:text-[#ea580c] hover:bg-orange-50 rounded-lg transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

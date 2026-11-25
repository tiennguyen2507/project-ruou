"use client";

import React from "react";
import { ExternalLink, Check, Copy, Globe, Smartphone, Clock } from "lucide-react";
import { ProxyHistoryItem } from "@/lib/proxyHistory";
import { formatVietnamTime } from "@/lib/formatTime";

interface SeedingResultCardProps {
  latestBackendRun: ProxyHistoryItem | null;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export function SeedingResultCard({
  latestBackendRun,
  copiedKey,
  onCopy,
}: SeedingResultCardProps) {
  if (!latestBackendRun) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-3 sm:p-3.5 space-y-2 animate-fade-in">
      {/* Top summary row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`w-2 h-2 rounded-full ${
              latestBackendRun.success ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="font-bold text-gray-800 text-xs sm:text-sm">
            Kết Quả Lượt Gần Nhất
          </span>
          <span
            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
              latestBackendRun.success
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            HTTP {latestBackendRun.status || 200}
          </span>

          {/* IP badge */}
          {latestBackendRun.ip && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
              <Globe className="w-3 h-3 text-gray-400" />
              <span className="font-semibold">{latestBackendRun.ip}</span>
              {latestBackendRun.location && (
                <span className="text-gray-400 text-[10px]">
                  ({latestBackendRun.location})
                </span>
              )}
            </span>
          )}

          {/* Device badge */}
          {latestBackendRun.device && (
            <span
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded truncate max-w-[220px]"
              title={latestBackendRun.device}
            >
              <Smartphone className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{latestBackendRun.device}</span>
            </span>
          )}
        </div>

        {/* Time */}
        <div className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-mono ml-auto">
          <Clock className="w-3 h-3 text-gray-400" />
          <span>{formatVietnamTime(latestBackendRun.timestamp)}</span>
        </div>
      </div>

      {/* Final URL Row (compact) */}
      {latestBackendRun.finalUrl && (
        <div className="flex items-center justify-between gap-2 bg-orange-50/50 border border-orange-200/60 rounded-lg px-2.5 py-1.5 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-bold text-[#ea580c] shrink-0 text-[11px]">
              URL Đích:
            </span>
            <span
              className="font-mono text-gray-800 text-xs truncate select-all"
              title={latestBackendRun.finalUrl}
            >
              {latestBackendRun.finalUrl}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onCopy(latestBackendRun.finalUrl, "finalUrl")}
              className="inline-flex items-center gap-1 text-[#ea580c] hover:text-orange-700 font-medium text-[11px] px-2 py-1 rounded hover:bg-orange-100/60 transition cursor-pointer"
              title="Sao chép URL đích"
            >
              {copiedKey === "finalUrl" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
            <a
              href={latestBackendRun.finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-white transition"
              title="Mở liên kết trong tab mới"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

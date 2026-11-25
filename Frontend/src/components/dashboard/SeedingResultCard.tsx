"use client";

import React, { useMemo } from "react";
import { ExternalLink, Check, Copy } from "lucide-react";
import { ProxyHistoryItem } from "@/lib/proxyHistory";

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
  const finalQueryParams = useMemo(() => {
    if (!latestBackendRun?.finalUrl) return [];
    try {
      const url = new URL(latestBackendRun.finalUrl);
      const params: { key: string; value: string }[] = [];
      url.searchParams.forEach((val, k) => {
        params.push({ key: k, value: val });
      });
      return params;
    } catch {
      return [];
    }
  }, [latestBackendRun?.finalUrl]);

  if (!latestBackendRun) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 sm:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              latestBackendRun.success ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <h3 className="font-bold text-gray-900 text-sm">
            Kết Quả Lượt Chạy Gần Nhất (Từ Backend)
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              latestBackendRun.success
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            HTTP {latestBackendRun.status}
          </span>
        </div>

        <div className="text-[11px] text-gray-400 font-mono">
          {latestBackendRun.timestamp}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* IP Box */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="text-[11px] text-gray-400 font-medium">IP Đầu Ra Proxy</div>
          <div className="text-sm font-bold font-mono text-gray-900">
            {latestBackendRun.ip || "Không rõ IP"}
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            {latestBackendRun.location || "Việt Nam"}
          </div>
        </div>

        {/* Device Box */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="text-[11px] text-gray-400 font-medium">Thiết Bị Giả Lập</div>
          <div className="text-xs font-bold text-gray-900 truncate">
            {latestBackendRun.device || "Desktop Browser"}
          </div>
          <div className="text-[10px] text-gray-500">
            Backend tự động luân phiên
          </div>
        </div>

        {/* Referer Box */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
          <div className="text-[11px] text-gray-400 font-medium">Kiểu Redirect</div>
          <div className="text-xs font-bold text-gray-900 truncate">
            {latestBackendRun.redirectType || "x-redirect-url"}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">
            Affiliate tracking
          </div>
        </div>
      </div>

      {/* Final URL Box */}
      <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#ea580c] flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>URL Đích Cuối Cùng (Final Landing Page):</span>
          </span>
          <button
            type="button"
            onClick={() => onCopy(latestBackendRun.finalUrl, "finalUrl")}
            className="text-[#ea580c] hover:underline font-medium text-[11px] flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === "finalUrl" ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>

        <div className="font-mono text-xs text-gray-800 break-all bg-white p-2.5 rounded-lg border border-orange-200/40">
          {latestBackendRun.finalUrl}
        </div>
      </div>

      {/* Extracted Parameters */}
      {finalQueryParams.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-bold text-gray-700">
            Các Tham Số Tracking Nhận Được ({finalQueryParams.length} params):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {finalQueryParams.map((p) => (
              <div
                key={p.key}
                className="inline-flex items-center text-[11px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
              >
                <span className="bg-gray-100 text-gray-700 px-2 py-1 font-semibold border-r border-gray-200">
                  {p.key}
                </span>
                <span className="px-2 py-1 text-gray-800 truncate max-w-xs">
                  {p.value}
                </span>
                <button
                  type="button"
                  onClick={() => onCopy(p.value, `param-${p.key}`)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 cursor-pointer"
                  title="Sao chép giá trị"
                >
                  {copiedKey === `param-${p.key}` ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

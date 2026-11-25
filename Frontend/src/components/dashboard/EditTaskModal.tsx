"use client";

import React from "react";
import { Pencil, X, Globe2, Clock, Server, RotateCw, Check, Sparkles } from "lucide-react";
import { BackendAutoRunTask } from "@/lib/proxyApi";
import { convertRawProxyToSocks5 } from "@/lib/parseProxy";

interface EditTaskModalProps {
  task: BackendAutoRunTask | null;
  onClose: () => void;
  targetUrl: string;
  onTargetUrlChange: (val: string) => void;
  proxyUrl: string;
  onProxyUrlChange: (val: string) => void;
  minDelay: number | string;
  onMinDelayChange: (val: number | string) => void;
  maxDelay: number | string;
  onMaxDelayChange: (val: number | string) => void;
  isSaving: boolean;
  onSubmit: (e?: React.FormEvent) => void;
}

export function EditTaskModal({
  task,
  onClose,
  targetUrl,
  onTargetUrlChange,
  proxyUrl,
  onProxyUrlChange,
  minDelay,
  onMinDelayChange,
  maxDelay,
  onMaxDelayChange,
  isSaving,
  onSubmit,
}: EditTaskModalProps) {
  const handleConvertHomeProxy = async () => {
    if (proxyUrl.trim()) {
      onProxyUrlChange(convertRawProxyToSocks5(proxyUrl));
      return;
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          onProxyUrlChange(convertRawProxyToSocks5(text));
        }
      }
    } catch {}
  };

  const handleProxyInputChange = (val: string) => {
    if (val.includes(":") && !val.includes("://") && val.split(":").length >= 4) {
      onProxyUrlChange(convertRawProxyToSocks5(val));
    } else {
      onProxyUrlChange(val);
    }
  };

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Chỉnh Sửa URL & Cấu Hình Tự Động
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                ID: {task.id} • {task.totalRuns || 0} lượt chạy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* URL Target */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-600" />
              <span>URL Cần Kiểm Tra (Target URL)</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => onTargetUrlChange(e.target.value)}
              placeholder="https://shorten.asia/..."
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/40 focus:bg-white text-gray-900"
            />
            <p className="text-[11px] text-gray-400">
              URL đích hoặc liên kết affiliate cần chạy seeding tự động.
            </p>
          </div>

          {/* Thời Gian Hẹn Giờ Giãn Cách (Delay Cadence & Presets) */}
          <div className="space-y-2.5 bg-orange-50/40 p-4 rounded-xl border border-orange-200/60">
            <div className="grid grid-cols-2 gap-3">
              {/* Min Seconds */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>Thời gian tối thiểu (Min)</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={minDelay}
                    onChange={(e) =>
                      onMinDelayChange(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ea580c] bg-white text-gray-900"
                    placeholder="30"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-gray-400 font-semibold">
                    giây
                  </span>
                </div>
              </div>

              {/* Max Seconds */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>Thời gian tối đa (Max)</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxDelay}
                    onChange={(e) =>
                      onMaxDelayChange(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ea580c] bg-white text-gray-900"
                    placeholder="60"
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] text-gray-400 font-semibold">
                    giây
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-1 space-y-1.5">
              <div className="text-xs font-semibold text-gray-600">
                Khoảng ngẫu nhiên (Click chọn nhanh):
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: "30s - 60s", min: 30, max: 60 },
                  { label: "60s - 180s (Khuyên dùng)", min: 60, max: 180 },
                  { label: "120s - 240s", min: 120, max: 240 },
                  { label: "5p - 10p", min: 300, max: 600 },
                ].map((preset) => {
                  const isSelected =
                    Number(minDelay) === preset.min && Number(maxDelay) === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        onMinDelayChange(preset.min);
                        onMaxDelayChange(preset.max);
                      }}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer font-medium ${
                        isSelected
                          ? "bg-[#ea580c] text-white border-[#ea580c] shadow-2xs font-bold"
                          : "bg-white hover:bg-orange-50 text-gray-700 hover:text-[#ea580c] border-gray-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Proxy URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span>SOCKS5 Proxy Riêng Cho URL Này</span>
                <span className="text-gray-400 font-normal">(Tùy chọn)</span>
              </label>

              <button
                type="button"
                onClick={handleConvertHomeProxy}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-lg transition cursor-pointer shadow-2xs"
                title="Chuyển đổi hoặc dán định dạng HomeProxy (IP:Port:User:Pass)"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Dán từ HomeProxy</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={proxyUrl}
                onChange={(e) => handleProxyInputChange(e.target.value)}
                placeholder="socks5://user:pass@host:port (hoặc dán IP:Port:User:Pass)"
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/40 focus:bg-white text-gray-900 pr-9"
              />
              {proxyUrl && !proxyUrl.startsWith("socks5://") && proxyUrl.includes(":") && (
                <button
                  type="button"
                  onClick={handleConvertHomeProxy}
                  className="absolute right-2 top-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition cursor-pointer"
                  title="Chuyển ngay sang link SOCKS5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-400">
              ⚡ Hỗ trợ dán trực tiếp định dạng HomeProxy: <span className="font-mono text-gray-600">IP:Port:User:Pass</span> sẽ tự động chuyển thành link <span className="font-mono text-gray-600">socks5://</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe2,
  Play,
  ArrowLeft,
  Copy,
  Check,
  Search,
  Trash2,
  ExternalLink,
  RotateCw,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import {
  ProxyHistoryItem,
  getProxyHistory,
  saveProxyHistory,
  clearProxyHistory,
} from "@/lib/proxyHistory";
import { getBackendProxyHistory, clearBackendProxyHistory } from "@/lib/api";

export default function ProxyHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ProxyHistoryItem[]>([]);
  const [searchHistory, setSearchHistory] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">(
    "all"
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadHistory = async () => {
    try {
      const beHistory = await getBackendProxyHistory();
      if (Array.isArray(beHistory)) {
        setHistory(beHistory);
        saveProxyHistory(beHistory);
        return;
      }
    } catch (e) {
      console.error("Lỗi khi tải lịch sử từ Backend:", e);
    }
    setHistory(getProxyHistory());
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "--";
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const MM = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${hh}:${mm} ${dd}/${MM}/${yyyy}`;
      }
    } catch { }
    return timeStr;
  };

  useEffect(() => {
    loadHistory();

    const handleUpdate = () => loadHistory();
    window.addEventListener("proxy_history_updated", handleUpdate);
    const interval = setInterval(loadHistory, 4000);
    return () => {
      window.removeEventListener("proxy_history_updated", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Đã sao chép vào bộ nhớ tạm");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử chạy proxy?")) {
      try {
        await clearBackendProxyHistory();
      } catch { }
      clearProxyHistory();
      setHistory([]);
      showToast("Đã xóa toàn bộ lịch sử thành công");
    }
  };

  const handleRerun = (targetUrl: string) => {
    router.push(`/admin/proxy?target=${encodeURIComponent(targetUrl)}`);
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (statusFilter === "success" && !item.success) return false;
      if (statusFilter === "failed" && item.success) return false;
      if (searchHistory.trim()) {
        const q = searchHistory.toLowerCase().trim();
        return (
            (item.targetUrl || "").toLowerCase().includes(q) ||
          (item.finalUrl || "").toLowerCase().includes(q) ||
          (item.ip || "").toLowerCase().includes(q) ||
          (item.location || "").toLowerCase().includes(q) ||
          (item.id || "").includes(q) ||
          ((item.affSid || "").toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [history, statusFilter, searchHistory]);

  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  const successCount = useMemo(() => history.filter((h) => h.success).length, [history]);
  const failCount = history.length - successCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-once">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${toast.type === "success"
                ? "bg-emerald-900/95 text-emerald-100 border-emerald-700"
                : "bg-red-900/95 text-red-100 border-red-700"
              }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/proxy"
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
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-red-200/80 px-3 py-2 rounded-xl transition shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa lịch sử</span>
            </button>
          )}

          <Link
            href="/admin/proxy"
            className="flex items-center gap-2 bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Chạy lượt mới</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="text-xs font-medium text-gray-500">Tổng số lượt chạy</div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {history.length}
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
            {history.length > 0 ? `${Math.round((successCount / history.length) * 100)}%` : "0%"}
          </div>
        </div>
      </div>

      {/* Main History Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-bold text-gray-900 text-base">
              Danh sách chi tiết các lần chạy
            </h2>
            <span className="bg-orange-50 text-[#ea580c] font-bold text-xs px-2.5 py-0.5 rounded-full border border-orange-200/60">
              {filteredHistory.length} kết quả
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              Lưu trên Backend • Tự động xóa sau 3 ngày
            </span>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition ${statusFilter === "all"
                    ? "bg-gray-800 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Tất cả ({history.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("success");
                  setCurrentPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition ${statusFilter === "success"
                    ? "bg-[#059669] text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Thành công ({successCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("failed");
                  setCurrentPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition ${statusFilter === "failed"
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
                onChange={(e) => {
                  setSearchHistory(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm URL, UID, IP, Vị trí..."
                className="w-full pl-3 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
              />
            </div>

            <button
              type="button"
              onClick={loadHistory}
              title="Làm mới lịch sử"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* List items */}
        <div className="divide-y divide-gray-100">
          {filteredHistory.length === 0 ? (
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
                href="/admin/proxy"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs shadow-emerald-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Đến trang chạy Proxy</span>
              </Link>
            </div>
          ) : (
            paginatedHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 hover:bg-gray-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                {/* Left: Icon + Target & Final URL */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${item.success
                        ? "bg-[#ffedd5] text-[#ea580c]"
                        : "bg-red-100 text-red-600"
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
                          onClick={() => copyToClipboard(item.id, `id-${item.id}`)}
                          className="hover:opacity-75"
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
                        onClick={() =>
                          copyToClipboard(item.finalUrl, `url-${item.id}`)
                        }
                        title="Sao chép URL cuối"
                        className="text-gray-400 hover:text-gray-700 shrink-0"
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
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${item.success
                        ? "bg-[#d1fae5] text-[#059669]"
                        : "bg-red-50 text-red-600"
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
                    <div className="text-gray-600 font-medium">
                      {item.location}
                    </div>
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
                    onClick={() => handleRerun(item.targetUrl)}
                    title="Chạy lại link này"
                    className="p-1.5 text-gray-400 hover:text-[#ea580c] hover:bg-orange-50 rounded-lg transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        {filteredHistory.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredHistory.length)} trên tổng số{" "}
              {filteredHistory.length} dòng
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${currentPage === pageNum
                        ? "bg-[#ea580c] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-1 text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${currentPage === totalPages
                        ? "bg-[#ea580c] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  ProxyHistoryItem,
  getProxyHistory,
  saveProxyHistory,
  clearProxyHistory,
} from "@/lib/proxyHistory";
import { getBackendProxyHistory, clearBackendProxyHistory } from "@/lib/proxyApi";
import { HistoryHeader } from "@/components/history/HistoryHeader";
import { HistoryStatsBar } from "@/components/history/HistoryStatsBar";
import { HistoryControls } from "@/components/history/HistoryControls";
import { HistoryTable } from "@/components/history/HistoryTable";
import { HistoryPagination } from "@/components/history/HistoryPagination";

export default function ProxyHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ProxyHistoryItem[]>([]);
  const [searchHistory, setSearchHistory] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
  router.push(`/dashboard?target=${encodeURIComponent(targetUrl)}`);
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
          (item.affSid || "").toLowerCase().includes(q)
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

{/* Top Header & Navigation */ }
    <HistoryHeader hasHistory={history.length > 0} onClearHistory={handleClearHistory} />

{/* Stats Summary Bar */ }
  <HistoryStatsBar
    totalCount={history.length}
    successCount={successCount}
    failCount={failCount}
  />

{/* Main History Table Card */ }
<div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <HistoryControls
        filteredCount={filteredHistory.length}
        totalCount={history.length}
        successCount={successCount}
        failCount={failCount}
        statusFilter={statusFilter}
        onStatusFilterChange={(f) => {
          setStatusFilter(f);
          setCurrentPage(1);
        }}
        searchHistory={searchHistory}
        onSearchChange={(s) => {
          setSearchHistory(s);
          setCurrentPage(1);
        }}
        onRefresh={loadHistory}
      />

    <HistoryTable
      items={paginatedHistory}
      copiedKey={copiedKey}
      onCopy={copyToClipboard}
      onRerun={handleRerun}
      formatTime={formatTime}
    />

  <HistoryPagination
    currentPage={currentPage}
    totalPages={totalPages}
    pageSize={pageSize}
    filteredCount={filteredHistory.length}
    onPageChange={setCurrentPage}
  />
</div>
    </div >
  );
}

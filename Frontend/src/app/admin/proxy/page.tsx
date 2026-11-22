"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Globe2,
  Play,
  RotateCw,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Server,
  Smartphone,
  MapPin,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Pause,
  Timer,
  Zap,
  Plus,
  Trash2,
  Layers,
  Power,
} from "lucide-react";
import {
  runProxySeeding,
  ProxySeedingResponse,
  getBackendAutoRunStatus,
  getBackendAutoRunTasks,
  startBackendAutoRun,
  stopBackendAutoRun,
  addBackendAutoRunTask,
  toggleBackendAutoRunTask,
  deleteBackendAutoRunTask,
  getBackendProxyHistory,
  BackendAutoRunTask,
  BackendAutoRunStatus,
} from "@/lib/api";
import {
  ProxyHistoryItem,
  getProxyHistory,
  saveProxyHistory,
} from "@/lib/proxyHistory";

const DEFAULT_TARGET = "https://shorten.asia/fyscDRRV";

function ProxySeedingContent() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get("target") || DEFAULT_TARGET;

  const [targetUrl, setTargetUrl] = useState(initialTarget);
  const [proxyUrl, setProxyUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProxySeedingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<ProxyHistoryItem[]>([]);

  // Backend Background Auto Run State
  const [tasks, setTasks] = useState<BackendAutoRunTask[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [minDelaySec, setMinDelaySec] = useState<number | string>(60);
  const [maxDelaySec, setMaxDelaySec] = useState<number | string>(180);
  const delayInitializedRef = useRef(false);
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentDelay, setCurrentDelay] = useState<number | null>(null);
  const [autoRunCount, setAutoRunCount] = useState<number>(0);
  const [activeTaskRunningId, setActiveTaskRunningId] = useState<string | null>(null);
  const [nextTargetTask, setNextTargetTask] = useState<BackendAutoRunTask | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Safe ref for execution
  const targetUrlRef = useRef(targetUrl);
  targetUrlRef.current = targetUrl;

  const proxyUrlRef = useRef(proxyUrl);
  proxyUrlRef.current = proxyUrl;

  // Sync state from Backend
  const syncWithBackend = async () => {
    try {
      const [statusData, tasksData, historyData] = await Promise.all([
        getBackendAutoRunStatus(),
        getBackendAutoRunTasks(),
        getBackendProxyHistory().catch(() => []),
      ]);

      setIsBackendConnected(true);
      setIsAutoRunning(statusData.isRunning);
      if (!delayInitializedRef.current) {
        if (typeof statusData.minDelaySec === "number") setMinDelaySec(statusData.minDelaySec);
        if (typeof statusData.maxDelaySec === "number") setMaxDelaySec(statusData.maxDelaySec);
        delayInitializedRef.current = true;
      }
      setAutoRunCount(statusData.totalRuns);
      setActiveTaskRunningId(statusData.activeRunningTaskId);
      setTasks(tasksData);
      setNextTargetTask(statusData.nextTask);
      setCurrentDelay(statusData.currentDelaySec);

      if (statusData.isRunning && statusData.nextRunAt) {
        const diffSec = Math.max(
          0,
          Math.round((new Date(statusData.nextRunAt).getTime() - Date.now()) / 1000)
        );
        setCountdown(diffSec);
      } else {
        setCountdown(null);
      }

      if (Array.isArray(historyData)) {
        setHistory(historyData);
        saveProxyHistory(historyData);
      }
    } catch (e) {
      setIsBackendConnected(false);
    }
  };

  // Initial fetch and polling every 2.5 seconds
  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 2500);
    return () => clearInterval(interval);
  }, []);

  // Smooth local timer tick every 1s for independent URL countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update target URL if search param changes
  useEffect(() => {
    const paramTarget = searchParams.get("target");
    if (paramTarget) {
      setTargetUrl(paramTarget);
    }
  }, [searchParams]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Đã sao chép vào bộ nhớ tạm");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Core execution function (Manual single run)
  const executeProxyRun = async (overrideTarget?: string, overrideProxy?: string) => {
    const runTarget = (overrideTarget !== undefined ? overrideTarget : targetUrlRef.current).trim();
    if (!runTarget) {
      setError("Vui lòng nhập URL cần kiểm tra");
      return null;
    }

    setLoading(true);
    setError(null);

    const runProxy = (overrideProxy !== undefined ? overrideProxy : proxyUrlRef.current).trim();

    try {
      const payload = {
        url: runTarget,
        proxy: runProxy || undefined, // empty string means server .env proxy!
      };

      const res = await runProxySeeding(payload);
      setResult(res);

      // Extract aff_sid if available in finalUrl
      let affSid: string | undefined;
      try {
        const parsedUrl = new URL(res.finalUrl);
        affSid = parsedUrl.searchParams.get("aff_sid") || undefined;
      } catch {}

      // Add to local history
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()}`;

      const newItem: ProxyHistoryItem = {
        id: Math.floor(100000 + Math.random() * 900000).toString(),
        targetUrl: res.targetUrl,
        finalUrl: res.finalUrl,
        ip: res.proxyLocation?.ip || "Không rõ IP",
        location: res.proxyLocation?.details || "Viet Nam",
        status: res.status,
        device: res.device?.name || "Desktop Browser",
        redirectType: res.meta?.redirectType || "x-redirect-url",
        timestamp: timeStr,
        success: res.success,
        affSid,
      };

      const currentHistory = getProxyHistory();
      const updatedHistory = [newItem, ...currentHistory.slice(0, 49)];
      saveProxyHistory(updatedHistory);
      setHistory(updatedHistory);

      return res;
    } catch (err: any) {
      setError(err.message || "Không thể kết nối proxy hoặc kiểm tra URL");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Unified Handler: Thêm vào danh sách & Chạy dưới BE (Duy nhất 1 nút)
  const handleAddAndRunBackend = async () => {
    const url = targetUrl.trim();
    if (!url && tasks.length === 0) {
      showToast("Vui lòng nhập URL cần chạy dưới Backend", "error");
      return;
    }

    const min = Number(minDelaySec) || 60;
    const max = Number(maxDelaySec) || 180;

    if (min <= 0 || max <= 0 || max < min) {
      showToast("Vui lòng nhập khoảng giây hợp lệ (Min <= Max)", "error");
      return;
    }

    try {
      showToast("Đang thêm và kích hoạt chạy ngầm Backend...");
      const res = await startBackendAutoRun({
        minDelaySec: min,
        maxDelaySec: max,
        targetUrl: url || undefined,
        proxyUrl: proxyUrl.trim() || undefined,
      });

      setIsAutoRunning(res.isRunning);
      setAutoRunCount(res.totalRuns);
      if (url) {
        setTargetUrl("");
      }
      showToast(
        url
          ? "Đã thêm vào danh sách và kích hoạt chạy ngầm Backend 24/7!"
          : "Đã kích hoạt chạy ngầm Backend 24/7!"
      );
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi kích hoạt chạy ngầm Backend", "error");
    }
  };

  // Stop Backend Background Auto Run
  const stopAutoRun = async () => {
    try {
      await stopBackendAutoRun();
      setIsAutoRunning(false);
      setCountdown(null);
      showToast("Đã dừng tiến trình chạy ngầm Backend");
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi dừng tiến trình chạy ngầm", "error");
    }
  };

  // Toggle task status on Backend
  const handleToggleTask = async (id: string) => {
    try {
      await toggleBackendAutoRunTask(id);
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật URL", "error");
    }
  };

  // Delete task from Backend
  const handleDeleteTask = async (id: string) => {
    try {
      await deleteBackendAutoRunTask(id);
      showToast("Đã xóa URL khỏi Backend");
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi xóa URL", "error");
    }
  };

  // Run single task immediately
  const handleRunTaskImmediately = async (task: BackendAutoRunTask) => {
    try {
      showToast(`Đang kiểm tra: ${task.targetUrl}`);
      await executeProxyRun(task.targetUrl, task.proxyUrl);
      await syncWithBackend();
    } catch {}
  };

  // Apply Delay Setting to Backend on the fly
  const handleApplyDelay = async (overrideMin?: number, overrideMax?: number) => {
    const min = overrideMin !== undefined ? overrideMin : Number(minDelaySec);
    const max = overrideMax !== undefined ? overrideMax : Number(maxDelaySec);

    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0 || max < min) {
      showToast("Vui lòng nhập khoảng giây hợp lệ (Min <= Max)", "error");
      return;
    }

    try {
      if (isAutoRunning) {
        await startBackendAutoRun({ minDelaySec: min, maxDelaySec: max });
        showToast(`Đã áp dụng thời gian: ${min}s - ${max}s cho tiến trình đang chạy!`);
        await syncWithBackend();
      } else {
        showToast(`Đã lưu thời gian: ${min}s - ${max}s`);
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật thời gian", "error");
    }
  };

  // Preset buttons helper
  const setDelayPreset = async (min: number, max: number) => {
    setMinDelaySec(min);
    setMaxDelaySec(max);
    if (isAutoRunning) {
      await handleApplyDelay(min, max);
    } else {
      showToast(`Đã chọn khoảng delay: ${min}s - ${max}s`);
    }
  };

  // Enabled tasks memo
  const enabledTasks = useMemo(() => tasks.filter((t) => t.enabled), [tasks]);

  // Latest run from Backend
  const latestBackendRun = useMemo(() => {
    return history.length > 0 ? history[0] : null;
  }, [history]);

  // Extract query params for display
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-once">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === "success"
                ? "bg-emerald-900/95 text-emerald-100 border-emerald-700"
                : "bg-red-900/95 text-red-100 border-red-700"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-[#ea580c]" />
            <span>Proxy Seeding & Redirect Tool</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kiểm tra IP đầu ra của proxy, vị trí địa lý và giải mã toàn bộ chuỗi URL redirect affiliate
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/proxy/history"
            className="flex items-center gap-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-[#ea580c] px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 transition shadow-2xs"
          >
            <Clock className="w-4 h-4 text-[#ea580c]" />
            <span>Xem Lịch Sử</span>
            <span className="bg-orange-100 text-[#ea580c] text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
              {history.length}
            </span>
          </Link>
          <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] font-black text-xs flex items-center justify-center shadow-2xs">
            AU
          </div>
        </div>
      </div>

      {/* UNIFIED PROXY & AUTO RUN CONFIGURATION CARD */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs space-y-5 ${
          isAutoRunning
            ? "bg-gradient-to-br from-emerald-950/5 via-white to-emerald-50/30 border-emerald-500/80 ring-2 ring-emerald-500/20"
            : "bg-white border-gray-200/80"
        }`}
      >
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
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
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                Cấu hình & Tự động chạy ngầm Backend (Auto Run 24/7)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="bg-orange-50 text-[#ea580c] border border-orange-200/80 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
              <Layers className="w-3.5 h-3.5" />
              <span>{enabledTasks.length}/{tasks.length} URL kích hoạt</span>
            </span>
          </div>
        </div>

        {/* Row 1: Target URL (Full Width) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-gray-700 flex items-center gap-1.5">
              <span>URL cần kiểm tra (Target URL)</span>
              <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://shorten.asia/..."
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ea580c] font-mono"
            />
          </div>
        </div>

        {/* Row 2: Thời gian hẹn giờ / Giãn cách (Delay Cadence & Presets) */}
        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Min Seconds */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>Thời gian tối thiểu (Min)</span>
                <span className="text-[#ea580c]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={minDelaySec}
                  onChange={(e) => setMinDelaySec(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ea580c] font-mono"
                  placeholder="Ví dụ: 60"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400 font-semibold">
                  giây
                </span>
              </div>
            </div>

            {/* Max Seconds */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>Thời gian tối đa (Max)</span>
                <span className="text-[#ea580c]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={maxDelaySec}
                  onChange={(e) => setMaxDelaySec(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ea580c] font-mono"
                  placeholder="Ví dụ: 180"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400 font-semibold">
                  giây
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="md:col-span-6 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600">
                  Khoảng ngẫu nhiên (Click chọn nhanh):
                </label>
                {isAutoRunning && (
                  <button
                    type="button"
                    onClick={() => handleApplyDelay()}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Lưu số giây mới</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: "30s - 60s", min: 30, max: 60 },
                  { label: "60s - 180s (Khuyên dùng)", min: 60, max: 180 },
                  { label: "120s - 240s", min: 120, max: 240 },
                  { label: "5p - 10p", min: 300, max: 600 },
                ].map((preset) => {
                  const isSelected =
                    Number(minDelaySec) === preset.min && Number(maxDelaySec) === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDelayPreset(preset.min, preset.max)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer font-medium ${
                        isSelected
                          ? "bg-[#ea580c] text-white border-[#ea580c] shadow-2xs font-bold"
                          : "bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-[#ea580c] border-gray-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: SOCKS5 Proxy (Tùy chọn) - ĐƯỢC ĐƯA XUỐNG DƯỚI */}
        <div className="pt-3 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-gray-400" />
              <span>SOCKS5 Proxy (Tùy chọn)</span>
            </label>
          </div>
          <input
            type="text"
            value={proxyUrl}
            onChange={(e) => setProxyUrl(e.target.value)}
            placeholder="Mặc định: Proxy lưu trên hệ thống (hoặc nhập socks5h://...)"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#ea580c] font-mono"
          />
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Nút Dừng chạy (hiển thị khi tiến trình đang chạy ngầm) */}
            {isAutoRunning && (
              <button
                type="button"
                onClick={stopAutoRun}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold transition border border-red-200 shadow-2xs cursor-pointer"
                title="Dừng tiến trình chạy ngầm Backend"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Dừng chạy ({autoRunCount} lượt)</span>
              </button>
            )}

            {/* Nút: Thêm vào danh sách để chạy dưới BE */}
            <button
              type="button"
              onClick={handleAddAndRunBackend}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-xs shadow-emerald-600/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Thêm vào danh sách để chạy dưới BE</span>
            </button>
          </div>
        </div>

        {/* DANH SÁCH URL & PROXY CHẠY TỰ ĐỘNG (Auto Run Task Queue) */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ea580c]" />
              <h3 className="font-bold text-gray-900 text-sm">
                Danh Sách URL & Proxy Chạy Tự Động
              </h3>
              <span className="bg-orange-100 text-[#ea580c] text-[11px] font-black px-2 py-0.5 rounded-full">
                {enabledTasks.length} / {tasks.length} URL đang bật
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              ⚡ Mỗi URL hoạt động hoàn toàn độc lập với bộ hẹn giờ riêng biệt, tự động xoay proxy không chờ nhau
            </p>
          </div>

          {tasks.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium">
                Chưa có URL nào trong danh sách chạy tự động.
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Nhập URL ở trên rồi nhấn <span className="font-bold text-[#ea580c]">"+ Thêm vào List Auto"</span> hoặc <span className="font-bold text-emerald-600">"Bắt Đầu Chạy Tự Động"</span> để thêm tự động.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200/80 bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
                    <th className="py-2.5 px-3 w-12 text-center">Bật</th>
                    <th className="py-2.5 px-3 min-w-[220px]">URL Cần Kiểm Tra</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Proxy SOCKS5</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Hẹn Giờ / Đếm Ngược</th>
                    <th className="py-2.5 px-3 min-w-[110px]">Thống Kê</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Lần Chạy Cuối</th>
                    <th className="py-2.5 px-3 w-20 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task) => {
                    const isExecutingThis = Boolean(task.isExecuting);
                    // Đếm ngược độc lập cho từng URL riêng biệt
                    let taskCountdown: number | null = null;
                    if (isAutoRunning && task.enabled && task.nextRunAt) {
                      const diff = Math.round((new Date(task.nextRunAt).getTime() - nowTime) / 1000);
                      taskCountdown = Math.max(0, diff);
                    }

                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-gray-50/60 transition ${
                          !task.enabled ? "opacity-50 bg-gray-50/30" : ""
                        } ${
                          isExecutingThis
                            ? "bg-emerald-50/70 border-l-4 border-l-emerald-600"
                            : isAutoRunning && task.enabled
                            ? "hover:bg-emerald-50/20"
                            : ""
                        }`}
                      >
                        {/* Toggle On/Off */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            title={task.enabled ? "Tạm dừng URL này" : "Kích hoạt URL này"}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition ${
                              task.enabled
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        {/* URL */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 max-w-md">
                            <span className="font-mono text-gray-800 font-medium truncate">
                              {task.targetUrl}
                            </span>
                            {/* Countdown badge riêng biệt từng URL */}
                            {isAutoRunning && task.enabled && taskCountdown !== null && !isExecutingThis && (
                              <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                <span>{taskCountdown}s</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(task.targetUrl, `task-url-${task.id}`)}
                              className="text-gray-400 hover:text-gray-600 shrink-0"
                              title="Sao chép URL"
                            >
                              {copiedKey === `task-url-${task.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Proxy */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 max-w-[240px]">
                            {task.proxyUrl ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 truncate">
                                <Server className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="truncate">{task.proxyUrl}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                <Server className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>Proxy Mặc định hệ thống</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  task.proxyUrl || proxyUrl || "socks5h://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324",
                                  `task-proxy-${task.id}`
                                )
                              }
                              className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer p-1 hover:bg-gray-100 rounded transition"
                              title="Sao chép cấu hình Proxy"
                            >
                              {copiedKey === `task-proxy-${task.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Hẹn Giờ / Đếm Ngược Countdown Seconds TỪNG URL RIÊNG BIỆT (KHÔNG CHỜ NHAU) */}
                        <td className="py-2.5 px-3">
                          {isExecutingThis ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-1 rounded-lg text-[11px] animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                              <span>Đang gửi request...</span>
                            </span>
                          ) : isAutoRunning && task.enabled && taskCountdown !== null ? (
                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg font-bold text-xs shadow-2xs">
                              <Timer
                                className="w-3.5 h-3.5 text-emerald-600 animate-spin"
                                style={{ animationDuration: "3s" }}
                              />
                              <span>Kế tiếp sau:</span>
                              <span className="font-mono text-emerald-700 font-black text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-200 shadow-2xs">
                                {taskCountdown}s
                              </span>
                            </div>
                          ) : isAutoRunning && task.enabled ? (
                            <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50/50 border border-emerald-200 px-2 py-1 rounded-lg text-[11px]">
                              <Clock className="w-3 h-3 text-emerald-500 animate-pulse" />
                              <span>Đang xếp lịch...</span>
                            </div>
                          ) : !task.enabled ? (
                            <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                              Đã tắt
                            </span>
                          ) : (
                            <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                              Tạm dừng
                            </span>
                          )}
                        </td>

                        {/* Stats */}
                        <td className="py-2.5 px-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold text-[11px]">
                            {task.totalRuns || 0} lượt
                          </span>
                        </td>

                        {/* Last Run Info */}
                        <td className="py-2.5 px-3 text-gray-500">
                          {task.lastRun ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    task.lastSuccess
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {task.lastStatus || 200}
                                </span>
                                <span className="font-mono text-[11px] text-gray-600">
                                  {task.lastIp || ""}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400">{task.lastRun}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Chưa chạy</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              title="Xóa URL khỏi danh sách"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RESULTS DISPLAY CARD (TỪ BACKEND RUNNER) */}
      {latestBackendRun && (
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
                onClick={() => copyToClipboard(latestBackendRun.finalUrl, "finalUrl")}
                className="text-[#ea580c] hover:underline font-medium text-[11px] flex items-center gap-1"
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
                      onClick={() => copyToClipboard(p.value, `param-${p.key}`)}
                      className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50"
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
      )}

      {/* RECENT RUNS PREVIEW CARD & LINK TO DEDICATED HISTORY PAGE */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#ea580c]" />
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              Lịch Sử Chạy Gần Đây
            </h2>
            <span className="bg-orange-50 text-[#ea580c] font-bold text-xs px-2.5 py-0.5 rounded-full border border-orange-200/60">
              {history.length} lượt đã ghi nhận
            </span>
          </div>

          <Link
            href="/admin/proxy/history"
            className="flex items-center gap-1.5 text-xs font-bold text-[#ea580c] hover:text-[#c2410c] hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200/80 transition"
          >
            <span>Xem toàn bộ lịch sử</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5 most recent items preview */}
        <div className="divide-y divide-gray-100">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Chưa có lịch sử chạy proxy nào. Hãy thực hiện lượt chạy đầu tiên ở trên!
            </div>
          ) : (
            history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-3.5 hover:bg-gray-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                      item.success
                        ? "bg-[#ffedd5] text-[#ea580c]"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    P
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="font-bold text-gray-900 truncate max-w-sm sm:max-w-md">
                      {item.targetUrl}
                    </div>
                    <div className="text-gray-400 text-[11px] truncate max-w-xs sm:max-w-lg font-mono">
                      ↳ {item.finalUrl}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-[#e0f2fe] text-[#0284c7] text-[11px] font-bold px-2 py-0.5 rounded">
                    IP: {item.ip}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      item.success
                        ? "bg-[#d1fae5] text-[#059669]"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    HTTP {item.status}
                  </span>
                  <span className="text-gray-400 text-[11px] whitespace-nowrap ml-1">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer View All Link */}
        {history.length > 5 && (
          <div className="p-3 bg-gray-50/60 border-t border-gray-100 text-center">
            <Link
              href="/admin/proxy/history"
              className="text-xs font-bold text-[#ea580c] hover:underline inline-flex items-center gap-1"
            >
              <span>Xem thêm {history.length - 5} lượt chạy khác trên trang Lịch Sử</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProxySeedingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-400 text-sm">
          Đang tải trang Proxy Tool...
        </div>
      }
    >
      <ProxySeedingContent />
    </Suspense>
  );
}

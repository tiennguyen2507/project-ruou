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
  Pencil,
  X,
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
  updateBackendAutoRunTask,
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

function formatVietnamTime(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return (
      d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) +
      " • " +
      d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
    );
  } catch {
    return isoString;
  }
}

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

  // Edit task state & handlers
  const [editingTask, setEditingTask] = useState<BackendAutoRunTask | null>(null);
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [editProxyUrl, setEditProxyUrl] = useState("");
  const [editMinDelay, setEditMinDelay] = useState<number | string>(60);
  const [editMaxDelay, setEditMaxDelay] = useState<number | string>(180);
  const [editSaving, setEditSaving] = useState(false);

  const handleOpenEdit = (task: BackendAutoRunTask) => {
    setEditingTask(task);
    setEditTargetUrl(task.targetUrl);
    setEditProxyUrl(task.proxyUrl || "");
    setEditMinDelay(task.minDelaySec !== undefined ? task.minDelaySec : (Number(minDelaySec) || 60));
    setEditMaxDelay(task.maxDelaySec !== undefined ? task.maxDelaySec : (Number(maxDelaySec) || 180));
  };

  const handleCloseEdit = () => {
    setEditingTask(null);
    setEditTargetUrl("");
    setEditProxyUrl("");
    setEditMinDelay(60);
    setEditMaxDelay(180);
  };

  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingTask) return;

    const trimmedUrl = editTargetUrl.trim();
    if (!trimmedUrl) {
      showToast("URL không được để trống", "error");
      return;
    }

    const min = Number(editMinDelay) || 60;
    const max = Number(editMaxDelay) || 180;
    if (min <= 0 || max <= 0 || max < min) {
      showToast("Vui lòng nhập khoảng giây hợp lệ (Min <= Max)", "error");
      return;
    }

    try {
      setEditSaving(true);
      const updated = await updateBackendAutoRunTask(editingTask.id, {
        targetUrl: trimmedUrl,
        proxyUrl: editProxyUrl.trim(),
        minDelaySec: min,
        maxDelaySec: max,
      });
      // Cập nhật ngay trong local state để UI phản hồi tức thì
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...updated } : t))
      );
      showToast("Cập nhật URL & Cấu hình thành công");
      handleCloseEdit();
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật URL & Proxy", "error");
    } finally {
      setEditSaving(false);
    }
  };

  // Create task modal state & handlers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTargetUrl, setCreateTargetUrl] = useState("");
  const [createProxyUrl, setCreateProxyUrl] = useState("");
  const [createMinDelay, setCreateMinDelay] = useState<number | string>(60);
  const [createMaxDelay, setCreateMaxDelay] = useState<number | string>(180);
  const [createSaving, setCreateSaving] = useState(false);

  const handleOpenCreate = () => {
    setCreateTargetUrl(targetUrl || "");
    setCreateProxyUrl(proxyUrl || "");
    setCreateMinDelay(Number(minDelaySec) || 60);
    setCreateMaxDelay(Number(maxDelaySec) || 180);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
    setCreateTargetUrl("");
    setCreateProxyUrl("");
    setCreateMinDelay(60);
    setCreateMaxDelay(180);
  };

  const handleSaveCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedUrl = createTargetUrl.trim();
    if (!trimmedUrl) {
      showToast("URL không được để trống", "error");
      return;
    }

    const min = Number(createMinDelay) || 60;
    const max = Number(createMaxDelay) || 180;
    if (min <= 0 || max <= 0 || max < min) {
      showToast("Vui lòng nhập khoảng giây hợp lệ (Min <= Max)", "error");
      return;
    }

    try {
      setCreateSaving(true);
      await addBackendAutoRunTask({
        targetUrl: trimmedUrl,
        proxyUrl: createProxyUrl.trim() || undefined,
        minDelaySec: min,
        maxDelaySec: max,
      });
      showToast("Đã thêm URL vào danh sách chạy tự động!");
      handleCloseCreate();
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi thêm URL vào danh sách", "error");
    } finally {
      setCreateSaving(false);
    }
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingTask) handleCloseEdit();
        if (isCreateModalOpen) handleCloseCreate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingTask, isCreateModalOpen]);

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

  // Total runs calculated directly from actual tasks in the list
  const totalRunsCount = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (t.totalRuns || 0), 0);
  }, [tasks]);

  // Handler: Bật chạy lại toàn bộ URL trong danh sách
  const handleStartAll = async () => {
    try {
      const min = Number(minDelaySec) || 60;
      const max = Number(maxDelaySec) || 180;
      showToast("Đang kích hoạt chạy tất cả URL...");
      const res = await startBackendAutoRun({ minDelaySec: min, maxDelaySec: max });
      setIsAutoRunning(res.isRunning);
      showToast("Đã kích hoạt chạy tất cả URL dưới Backend!");
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi bật chạy tất cả", "error");
    }
  };

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
            href="/dashboard/history"
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
                  <span>{enabledTasks.length}/{tasks.length} URL kích hoạt</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isAutoRunning ? "bg-emerald-500 animate-ping" : "bg-gray-300"}`}></span>
                <span>Mỗi URL trong danh sách chạy độc lập theo bộ đếm giờ riêng</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto shrink-0">
            {/* Nút Tạm dừng tất cả (khi có URL đang chạy ngầm) */}
            {isAutoRunning && (
              <button
                type="button"
                onClick={stopAutoRun}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-red-200 shadow-2xs cursor-pointer"
                title="Tạm dừng toàn bộ các URL đang chạy ngầm Backend"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Tạm dừng tất cả ({totalRunsCount} lượt)</span>
              </button>
            )}

            {/* Nút Chạy tất cả (khi đang tạm dừng mà danh sách có URL) */}
            {!isAutoRunning && tasks.length > 0 && (
              <button
                type="button"
                onClick={handleStartAll}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-emerald-200 shadow-2xs cursor-pointer"
                title="Bật chạy lại tất cả URL trong danh sách"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Bật chạy tất cả ({tasks.length} URL)</span>
              </button>
            )}

            {/* Nút: Thêm URL vào danh sách */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs shadow-emerald-600/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm URL vào danh sách</span>
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
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer shadow-2xs ml-1"
                title="Mở form thêm URL mới"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm URL</span>
              </button>
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
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm URL mới ngay</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200/80 bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
                    <th className="py-2.5 px-3 min-w-[130px] text-center">Trạng Thái / Chạy BE</th>
                    <th className="py-2.5 px-3 min-w-[220px]">URL Cần Kiểm Tra</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Proxy SOCKS5</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Hẹn Giờ / Đếm Ngược</th>
                    <th className="py-2.5 px-3 min-w-[100px] text-center">Thống Kê</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Lần Chạy Cuối</th>
                    <th className="py-2.5 px-3 min-w-[90px] text-right">Thao Tác</th>
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
                        {/* Trạng Thái / Chạy BE riêng cho từng row */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            title={task.enabled ? "Bấm để tạm dừng URL này" : "Bấm để kích hoạt chạy ngầm URL này"}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                              task.enabled
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
                            }`}
                          >
                            {task.enabled ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                <span>Đang chạy</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-3 h-3 text-gray-400" />
                                <span>Tạm dừng</span>
                              </>
                            )}
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
                          <div className="space-y-1">
                            {/* Cadence badge hiển thị min - max giây cài đặt riêng cho task */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                ⏱ {task.minDelaySec || 60}s - {task.maxDelaySec || 180}s
                              </span>
                            </div>

                            {/* Live status / Countdown */}
                            {isExecutingThis ? (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-lg text-[11px] animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                                <span>Đang gửi request...</span>
                              </span>
                            ) : isAutoRunning && task.enabled && taskCountdown !== null ? (
                              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-lg font-bold text-xs shadow-2xs">
                                <Timer
                                  className="w-3.5 h-3.5 text-emerald-600 animate-spin"
                                  style={{ animationDuration: "3s" }}
                                />
                                <span>Kế tiếp sau:</span>
                                <span className="font-mono text-emerald-700 font-black text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-200 shadow-2xs">
                                  {taskCountdown > 0 ? `${taskCountdown}s` : "Đang chạy..."}
                                </span>
                              </div>
                            ) : isAutoRunning && task.enabled ? (
                              <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50/50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]">
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
                          </div>
                        </td>

                        {/* Stats */}
                        <td className="py-2.5 px-3 text-center">
                          <span className="bg-orange-50 text-[#ea580c] px-2.5 py-1 rounded-md font-bold text-xs border border-orange-200/60 font-mono">
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
                              <div className="text-[10px] text-gray-400 font-mono">
                                {formatVietnamTime(task.lastRun)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Chưa chạy</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(task)}
                              title="Chỉnh sửa URL & Proxy"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition border border-gray-200 hover:border-blue-300 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRunTaskImmediately(task)}
                              title="Chạy thử ngay 1 lượt cho URL này"
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-gray-200 hover:border-emerald-300 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              title="Xóa URL khỏi danh sách"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 cursor-pointer"
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
            href="/dashboard/history"
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
              href="/dashboard/history"
              className="text-xs font-bold text-[#ea580c] hover:underline inline-flex items-center gap-1"
            >
              <span>Xem thêm {history.length - 5} lượt chạy khác trên trang Lịch Sử</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={handleCloseCreate}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Thêm URL & Cấu Hình Tự Động
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Tự động nhận bộ hẹn giờ riêng và chạy ngầm 24/7 dưới Backend
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCreate}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="p-6 space-y-4">
              {/* URL Target */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>URL Cần Kiểm Tra (Target URL)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  autoFocus
                  value={createTargetUrl}
                  onChange={(e) => setCreateTargetUrl(e.target.value)}
                  placeholder="https://shorten.asia/..."
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-gray-50/40 focus:bg-white text-gray-900"
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
                        value={createMinDelay}
                        onChange={(e) =>
                          setCreateMinDelay(e.target.value === "" ? "" : Number(e.target.value))
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
                        value={createMaxDelay}
                        onChange={(e) =>
                          setCreateMaxDelay(e.target.value === "" ? "" : Number(e.target.value))
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
                        Number(createMinDelay) === preset.min &&
                        Number(createMaxDelay) === preset.max;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setCreateMinDelay(preset.min);
                            setCreateMaxDelay(preset.max);
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
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SOCKS5 Proxy Riêng Cho URL Này</span>
                  <span className="text-gray-400 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={createProxyUrl}
                  onChange={(e) => setCreateProxyUrl(e.target.value)}
                  placeholder="socks5h://user:pass@host:port (để trống dùng proxy mặc định)"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-gray-50/40 focus:bg-white text-gray-900"
                />
                <p className="text-[11px] text-gray-400">
                  Để trống nếu bạn muốn URL này dùng Proxy SOCKS5 mặc định của hệ thống.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  disabled={createSaving}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={createSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {createSaving ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang thêm...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Vào Danh Sách</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={handleCloseEdit}
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
                    ID: {editingTask.id} • {editingTask.totalRuns || 0} lượt chạy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
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
                  value={editTargetUrl}
                  onChange={(e) => setEditTargetUrl(e.target.value)}
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
                        value={editMinDelay}
                        onChange={(e) =>
                          setEditMinDelay(e.target.value === "" ? "" : Number(e.target.value))
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
                        value={editMaxDelay}
                        onChange={(e) =>
                          setEditMaxDelay(e.target.value === "" ? "" : Number(e.target.value))
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
                        Number(editMinDelay) === preset.min &&
                        Number(editMaxDelay) === preset.max;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setEditMinDelay(preset.min);
                            setEditMaxDelay(preset.max);
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
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  <span>SOCKS5 Proxy Riêng Cho URL Này</span>
                  <span className="text-gray-400 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={editProxyUrl}
                  onChange={(e) => setEditProxyUrl(e.target.value)}
                  placeholder="socks5h://user:pass@host:port (để trống dùng proxy mặc định)"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50/40 focus:bg-white text-gray-900"
                />
                <p className="text-[11px] text-gray-400">
                  Để trống nếu bạn muốn URL này dùng Proxy SOCKS5 mặc định của hệ thống.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={editSaving}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editSaving ? (
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
      )}
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

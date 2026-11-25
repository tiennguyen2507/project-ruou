"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  getBackendAutoRunStatus,
  getBackendAutoRunTasks,
  startBackendAutoRun,
  stopBackendAutoRun,
  toggleBackendAutoRunTask,
  deleteBackendAutoRunTask,
  getBackendProxyHistory,
  runProxySeeding,
  BackendAutoRunTask,
} from "@/lib/proxyApi";
import {
  ProxyHistoryItem,
  getProxyHistory,
  saveProxyHistory,
} from "@/lib/proxyHistory";
import { useTaskModals } from "./useTaskModals";

export function useDashboardState() {
  const [tasks, setTasks] = useState<BackendAutoRunTask[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [minDelaySec, setMinDelaySec] = useState<number | string>(60);
  const [maxDelaySec, setMaxDelaySec] = useState<number | string>(180);
  const delayInitializedRef = useRef(false);
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<ProxyHistoryItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Đã sao chép vào bộ nhớ tạm");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const syncWithBackend = async () => {
    try {
      const [statusData, tasksData, historyData] = await Promise.all([
        getBackendAutoRunStatus(),
        getBackendAutoRunTasks(),
        getBackendProxyHistory().catch(() => []),
      ]);

      setIsAutoRunning(statusData.isRunning);
      if (!delayInitializedRef.current) {
        if (typeof statusData.minDelaySec === "number") setMinDelaySec(statusData.minDelaySec);
        if (typeof statusData.maxDelaySec === "number") setMaxDelaySec(statusData.maxDelaySec);
        delayInitializedRef.current = true;
      }
      setTasks(tasksData);

      if (Array.isArray(historyData)) {
        setHistory(historyData);
        saveProxyHistory(historyData);
      }
    } catch {
      // Backend status poll failure handled silently
    }
  };

  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleStopAll = async () => {
    try {
      await stopBackendAutoRun();
      setIsAutoRunning(false);
      showToast("Đã dừng tiến trình chạy ngầm Backend");
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi dừng tiến trình chạy ngầm", "error");
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await toggleBackendAutoRunTask(id);
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật URL", "error");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteBackendAutoRunTask(id);
      showToast("Đã xóa URL khỏi Backend");
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi xóa URL", "error");
    }
  };

  const handleRunTaskImmediately = async (task: BackendAutoRunTask) => {
    try {
      showToast(`Đang kiểm tra: ${task.targetUrl}`);
      await runProxySeeding({
        url: task.targetUrl,
        proxy: task.proxyUrl || undefined,
      });
      await syncWithBackend();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi chạy thử URL", "error");
    }
  };

  const modals = useTaskModals({
    minDelaySec,
    maxDelaySec,
    onSuccess: syncWithBackend,
    showToast,
    onTaskUpdated: (updated) => {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    },
  });

  const enabledTasks = useMemo(() => tasks.filter((t) => t.enabled), [tasks]);
  const totalRunsCount = useMemo(
    () => tasks.reduce((sum, t) => sum + (t.totalRuns || 0), 0),
    [tasks]
  );
  const latestBackendRun = useMemo(() => (history.length > 0 ? history[0] : null), [history]);

  return {
    tasks,
    isAutoRunning,
    nowTime,
    copiedKey,
    history,
    toast,
    enabledTasks,
    totalRunsCount,
    latestBackendRun,
    showToast,
    copyToClipboard,
    handleStartAll,
    handleStopAll,
    handleToggleTask,
    handleDeleteTask,
    handleRunTaskImmediately,
    ...modals,
  };
}

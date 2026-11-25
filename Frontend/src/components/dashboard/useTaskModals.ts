"use client";

import { useState, useEffect } from "react";
import {
  BackendAutoRunTask,
  addBackendAutoRunTask,
  updateBackendAutoRunTask,
} from "@/lib/proxyApi";

interface UseTaskModalsProps {
  minDelaySec: number | string;
  maxDelaySec: number | string;
  onSuccess: () => Promise<void>;
  showToast: (message: string, type?: "success" | "error") => void;
  onTaskUpdated?: (updated: BackendAutoRunTask) => void;
}

export function useTaskModals({
  minDelaySec,
  maxDelaySec,
  onSuccess,
  showToast,
  onTaskUpdated,
}: UseTaskModalsProps) {
  // Edit task modal state
  const [editingTask, setEditingTask] = useState<BackendAutoRunTask | null>(null);
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [editProxyUrl, setEditProxyUrl] = useState("");
  const [editMinDelay, setEditMinDelay] = useState<number | string>(60);
  const [editMaxDelay, setEditMaxDelay] = useState<number | string>(180);
  const [editSaving, setEditSaving] = useState(false);

  // Create task modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTargetUrl, setCreateTargetUrl] = useState("");
  const [createProxyUrl, setCreateProxyUrl] = useState("");
  const [createMinDelay, setCreateMinDelay] = useState<number | string>(60);
  const [createMaxDelay, setCreateMaxDelay] = useState<number | string>(180);
  const [createSaving, setCreateSaving] = useState(false);

  // Keyboard Escape listener
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

  // Edit Modal Handlers
  const handleOpenEdit = (task: BackendAutoRunTask) => {
    setEditingTask(task);
    setEditTargetUrl(task.targetUrl);
    setEditProxyUrl(task.proxyUrl || "");
    setEditMinDelay(task.minDelaySec !== undefined ? task.minDelaySec : Number(minDelaySec) || 60);
    setEditMaxDelay(task.maxDelaySec !== undefined ? task.maxDelaySec : Number(maxDelaySec) || 180);
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
      if (onTaskUpdated) {
        onTaskUpdated({ ...editingTask, ...updated });
      }
      showToast("Cập nhật URL & Cấu hình thành công");
      handleCloseEdit();
      await onSuccess();
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật URL & Proxy", "error");
    } finally {
      setEditSaving(false);
    }
  };

  // Create Modal Handlers
  const handleOpenCreate = () => {
    setCreateTargetUrl("");
    setCreateProxyUrl("");
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
      await onSuccess();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi thêm URL vào danh sách", "error");
    } finally {
      setCreateSaving(false);
    }
  };

  return {
    editingTask,
    editTargetUrl,
    setEditTargetUrl,
    editProxyUrl,
    setEditProxyUrl,
    editMinDelay,
    setEditMinDelay,
    editMaxDelay,
    setEditMaxDelay,
    editSaving,
    handleOpenEdit,
    handleCloseEdit,
    handleSaveEdit,
    isCreateModalOpen,
    createTargetUrl,
    setCreateTargetUrl,
    createProxyUrl,
    setCreateProxyUrl,
    createMinDelay,
    setCreateMinDelay,
    createMaxDelay,
    setCreateMaxDelay,
    createSaving,
    handleOpenCreate,
    handleCloseCreate,
    handleSaveCreate,
  };
}

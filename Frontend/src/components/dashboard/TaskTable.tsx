"use client";

import React from "react";
import { Layers, Plus } from "lucide-react";
import { BackendAutoRunTask } from "@/lib/proxyApi";
import { TaskTableRow } from "./TaskTableRow";

interface TaskTableProps {
  tasks: BackendAutoRunTask[];
  isAutoRunning: boolean;
  nowTime: number;
  copiedKey: string | null;
  defaultProxy?: string;
  onOpenCreate: () => void;
  onToggleTask: (id: string) => void;
  onOpenEdit: (task: BackendAutoRunTask) => void;
  onDeleteTask: (id: string) => void;
  onRunImmediately: (task: BackendAutoRunTask) => void;
  onCopy: (text: string, key: string) => void;
}

export function TaskTable({
  tasks,
  isAutoRunning,
  nowTime,
  copiedKey,
  defaultProxy,
  onOpenCreate,
  onToggleTask,
  onOpenEdit,
  onDeleteTask,
  onRunImmediately,
  onCopy,
}: TaskTableProps) {
  const enabledCount = tasks.filter((t) => t.enabled).length;

  return (
    <div className="pt-4 border-t border-gray-100 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#ea580c]" />
          <h3 className="font-bold text-gray-900 text-sm">
            Danh Sách URL & Proxy Chạy Tự Động
          </h3>
          <span className="bg-orange-100 text-[#ea580c] text-[11px] font-black px-2 py-0.5 rounded-full">
            {enabledCount} / {tasks.length} URL đang bật
          </span>
          <button
            type="button"
            onClick={onOpenCreate}
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
            onClick={onOpenCreate}
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
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 min-w-[280px]">URL Cần Kiểm Tra</th>
                <th className="py-3 px-3 min-w-[180px]">Proxy SOCKS5</th>
                <th className="py-3 px-3 min-w-[170px]">Hẹn Giờ / Đếm Ngược</th>
                <th className="py-3 px-3 min-w-[90px] text-center">Thống Kê</th>
                <th className="py-3 px-3 min-w-[140px]">Lần Chạy Cuối</th>
                <th className="py-3 px-3 min-w-[130px] text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  isAutoRunning={isAutoRunning}
                  nowTime={nowTime}
                  copiedKey={copiedKey}
                  defaultProxy={defaultProxy}
                  onToggleTask={onToggleTask}
                  onOpenEdit={onOpenEdit}
                  onDeleteTask={onDeleteTask}
                  onRunImmediately={onRunImmediately}
                  onCopy={onCopy}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

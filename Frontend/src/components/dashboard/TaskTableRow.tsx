"use client";

import React from "react";
import { Server, Timer, Clock, Zap, Trash2, Pencil, Copy, Check, Power } from "lucide-react";
import { BackendAutoRunTask } from "@/lib/proxyApi";
import { formatVietnamTime } from "@/lib/formatTime";

interface TaskTableRowProps {
  task: BackendAutoRunTask;
  isAutoRunning: boolean;
  nowTime: number;
  copiedKey: string | null;
  defaultProxy?: string;
  onToggleTask: (id: string) => void;
  onOpenEdit: (task: BackendAutoRunTask) => void;
  onDeleteTask: (id: string) => void;
  onRunImmediately: (task: BackendAutoRunTask) => void;
  onCopy: (text: string, key: string) => void;
}

export function TaskTableRow({
  task,
  isAutoRunning,
  nowTime,
  copiedKey,
  defaultProxy,
  onToggleTask,
  onOpenEdit,
  onDeleteTask,
  onRunImmediately,
  onCopy,
}: TaskTableRowProps) {
  const isExecutingThis = Boolean(task.isExecuting);
  let taskCountdown: number | null = null;
  if (isAutoRunning && task.enabled && task.nextRunAt) {
    const diff = Math.round((new Date(task.nextRunAt).getTime() - nowTime) / 1000);
    taskCountdown = Math.max(0, diff);
  }

  return (
    <tr
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
      {/* Status Toggle */}
      <td className="py-2.5 px-3 text-center">
        <button
          type="button"
          onClick={() => onToggleTask(task.id)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
            task.enabled
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300"
          }`}
          title={task.enabled ? "Click để tắt URL này" : "Click để bật URL này"}
        >
          <Power className="w-3 h-3" />
          <span>{task.enabled ? "Đang Bật" : "Tạm Tắt"}</span>
        </button>
      </td>

      {/* Target URL */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5 max-w-[260px]">
          <span className="font-mono text-gray-800 font-medium truncate">
            {task.targetUrl}
          </span>
          {isAutoRunning && task.enabled && taskCountdown !== null && !isExecutingThis && (
            <span className="bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>{taskCountdown}s</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => onCopy(task.targetUrl, `task-url-${task.id}`)}
            className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
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
              onCopy(task.proxyUrl || defaultProxy || "", `task-proxy-${task.id}`)
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

      {/* Delay & Countdown */}
      <td className="py-2.5 px-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
              ⏱ {task.minDelaySec || 60}s - {task.maxDelaySec || 180}s
            </span>
          </div>

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
            onClick={() => onOpenEdit(task)}
            title="Chỉnh sửa URL & Proxy"
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition border border-gray-200 hover:border-blue-300 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRunImmediately(task)}
            title="Chạy thử ngay 1 lượt cho URL này"
            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-gray-200 hover:border-emerald-300 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            title="Xóa URL khỏi danh sách"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

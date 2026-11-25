"use client";

import React from "react";
import { Server, Timer, Clock, Zap, Trash2, Pencil, Copy, Check, Power, ExternalLink } from "lucide-react";
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

function formatProxyDisplay(raw: string): string {
  try {
    const parsed = new URL(raw);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return raw;
  }
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
        !task.enabled ? "opacity-55 bg-gray-50/30" : ""
      } ${
        isExecutingThis
          ? "bg-emerald-50/70 border-l-4 border-l-emerald-600"
          : isAutoRunning && task.enabled
          ? "hover:bg-emerald-50/20"
          : ""
      }`}
    >
      {/* 1. Target URL */}
      <td className="py-3 px-3 align-middle">
        <div className="flex items-center gap-2 max-w-sm lg:max-w-md xl:max-w-lg">
          <span
            className="font-mono text-gray-900 font-semibold text-xs truncate select-all"
            title={task.targetUrl}
          >
            {task.targetUrl}
          </span>
          <button
            type="button"
            onClick={() => onCopy(task.targetUrl, `task-url-${task.id}`)}
            className="text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer p-1 rounded hover:bg-gray-100 transition"
            title="Sao chép URL"
          >
            {copiedKey === `task-url-${task.id}` ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <a
            href={task.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-600 shrink-0 p-1 rounded hover:bg-gray-100 transition"
            title="Mở liên kết trong tab mới"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </td>

      {/* 3. Proxy */}
      <td className="py-3 px-3 align-middle">
        <div className="flex items-center gap-1.5 max-w-[240px]">
          {task.proxyUrl ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate"
              title={task.proxyUrl}
            >
              <Server className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{formatProxyDisplay(task.proxyUrl)}</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded border border-emerald-200 shrink-0"
              title={defaultProxy || "IP Pool mặc định hệ thống"}
            >
              <Server className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>IP Pool Mặc định</span>
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              onCopy(task.proxyUrl || defaultProxy || "", `task-proxy-${task.id}`)
            }
            className="text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer p-1 hover:bg-gray-100 rounded transition"
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

      {/* 4. Cadence & Countdown */}
      <td className="py-3 px-3 align-middle">
        <div className="flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-500 font-medium bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
            <span>Chu kỳ:</span>
            <span className="font-bold text-gray-700">
              {task.minDelaySec || 60}s - {task.maxDelaySec || 180}s
            </span>
          </span>

          {isExecutingThis ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-md text-[11px] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              <span>Đang gửi request...</span>
            </span>
          ) : isAutoRunning && task.enabled && taskCountdown !== null ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-xs font-semibold shadow-2xs">
              <Timer
                className="w-3.5 h-3.5 text-emerald-600 animate-spin"
                style={{ animationDuration: "3s" }}
              />
              <span className="text-[11px] text-gray-600">Kế tiếp sau:</span>
              <span className="font-mono text-emerald-700 font-black text-xs">
                {taskCountdown > 0 ? `${taskCountdown}s` : "Chạy ngay..."}
              </span>
            </div>
          ) : isAutoRunning && task.enabled ? (
            <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50/50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>Đang xếp lịch...</span>
            </div>
          ) : !task.enabled ? (
            <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium">
              Đã tắt
            </span>
          ) : (
            <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium">
              Tạm dừng
            </span>
          )}
        </div>
      </td>

      {/* 5. Stats */}
      <td className="py-3 px-3 text-center align-middle">
        <span className="inline-flex items-center justify-center bg-orange-50 text-[#ea580c] px-2.5 py-1 rounded-md font-bold text-xs border border-orange-200/60 font-mono shadow-2xs">
          {(task.totalRuns || 0).toLocaleString()} lượt
        </span>
      </td>

      {/* 6. Last Run Info */}
      <td className="py-3 px-3 text-gray-500 align-middle">
        {task.lastRun ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  task.lastSuccess
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {task.lastStatus || (task.lastSuccess ? "200" : "ERR")}
              </span>
              {task.lastIp && (
                <span
                  className="font-mono text-[11px] text-gray-600 truncate max-w-[100px]"
                  title={task.lastIp}
                >
                  {task.lastIp}
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              {formatVietnamTime(task.lastRun)}
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-xs italic">Chưa chạy</span>
        )}
      </td>

      {/* 6. Action buttons */}
      <td className="py-3 px-3 text-center align-middle">
        <div className="flex items-center justify-center gap-1.5">
          {/* Toggle Bật / Tắt */}
          <button
            type="button"
            onClick={() => onToggleTask(task.id)}
            title={task.enabled ? "Đang Bật - Click để tạm dừng" : "Đang Tắt - Click để kích hoạt"}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition border shadow-2xs cursor-pointer ${
              task.enabled
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 border-gray-200"
            }`}
          >
            <Power className={`w-3 h-3 ${task.enabled ? "text-emerald-600" : "text-gray-400"}`} />
            <span>{task.enabled ? "Bật" : "Tắt"}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenEdit(task)}
            title="Chỉnh sửa URL & Proxy"
            className="p-1.5 text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-lg transition border border-gray-200 hover:border-blue-300 shadow-2xs cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRunImmediately(task)}
            title="Chạy thử ngay 1 lượt cho URL này"
            className="p-1.5 text-emerald-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg transition border border-gray-200 hover:border-emerald-300 shadow-2xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            title="Xóa URL khỏi danh sách"
            className="p-1.5 text-red-500 hover:text-red-700 bg-white hover:bg-red-50 rounded-lg transition border border-gray-200 hover:border-red-300 shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

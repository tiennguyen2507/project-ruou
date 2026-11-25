"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe2,
  Clock,
  Menu,
  X,
  FileCode,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Nhóm Proxy Seeding đang active khi đường dẫn bắt đầu bằng /dashboard/proxy hoặc /dashboard
  const isProxyActive =
    pathname.startsWith("/dashboard/proxy") ||
    pathname === "/dashboard" ||
    pathname === "/dashboard/history";

  // Trạng thái đóng/mở của danh mục Proxy Seeding
  const [isProxyOpen, setIsProxyOpen] = useState(true);

  // Tự động mở rộng khi đang ở trang thuộc proxy
  useEffect(() => {
    if (isProxyActive) {
      setIsProxyOpen(true);
    }
  }, [isProxyActive]);

  const isProxyAutoRunActive =
    pathname === "/dashboard/proxy" || pathname === "/dashboard";
  const isProxyHistoryActive =
    pathname === "/dashboard/proxy/history" || pathname === "/dashboard/history";

  const swaggerUrl =
    process.env.NEXT_PUBLIC_SWAGGER_URL ||
    "https://project-ruou.onrender.com/api/docs";

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-gray-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link
          href="/dashboard/proxy/history"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-black text-gray-900 text-lg tracking-tight leading-none flex items-center gap-1">
              <span>API</span>
              <span className="text-blue-600">Common</span>
            </div>
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600 mt-1">
              Management Dashboard
            </div>
          </div>
        </Link>

        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2 scrollbar-thin">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Công Cụ Hệ Thống
        </div>

        {/* Collapsible Proxy Seeding Group */}
        <div className="space-y-1">
          {/* Group Header Button (Chỉ mở / đóng, sáng khi map với proxy) */}
          <button
            type="button"
            onClick={() => setIsProxyOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all group cursor-pointer ${
              isProxyActive
                ? "bg-blue-50/80 text-blue-700 font-bold border border-blue-100 shadow-2xs"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }`}
            title="Click để Mở / Đóng danh mục Proxy Seeding"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Globe2
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isProxyActive
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span className="truncate">Proxy Seeding</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isProxyActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              )}
              {isProxyOpen ? (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isProxyActive ? "text-blue-600" : "text-gray-400"
                  }`}
                />
              ) : (
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isProxyActive ? "text-blue-600" : "text-gray-400"
                  }`}
                />
              )}
            </div>
          </button>

          {/* Sub Items (Collapsible Menu List) */}
          {isProxyOpen && (
            <div className="ml-4 pl-3 py-1 space-y-1 border-l-2 border-gray-100 transition-all">
              {/* Trang 1: Cấu hình & Tự động */}
              <Link
                href="/dashboard/proxy"
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isProxyAutoRunActive
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isProxyAutoRunActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span className="truncate">Cấu hình & Tự động</span>
                </div>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                    isProxyAutoRunActive
                      ? "bg-white/20 text-white"
                      : "bg-orange-100 text-[#ea580c]"
                  }`}
                >
                  Auto
                </span>
              </Link>

              {/* Trang 2: Lịch sử Seeding */}
              <Link
                href="/dashboard/proxy/history"
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isProxyHistoryActive
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isProxyHistoryActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span className="truncate">Lịch sử Seeding</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Swagger API Docs */}
        <div className="pt-2 border-t border-gray-100">
          <a
            href={swaggerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileCode className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
              <span className="truncate">Swagger API Docs</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
          </a>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-400 flex items-center justify-between">
        <span>api-common.tikat.vn</span>
        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
          v2.0
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col antialiased">
      {/* Mobile Topbar */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -ml-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-gray-900">
            API <span className="text-blue-600">Common</span>
          </span>
        </div>

        <div className="w-8" />
      </div>

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-gray-200/80 shrink-0 sticky top-0 h-screen overflow-hidden">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Modal */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 transition-transform">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

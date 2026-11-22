"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe2,
  Clock,
  Menu,
  X,
  FileCode,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isExternal?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Proxy Seeding & Auto Run",
    href: "/dashboard",
    icon: Globe2,
    badge: "Auto",
  },
  {
    label: "Lịch sử Seeding",
    href: "/dashboard/history",
    icon: Clock,
  },
  {
    label: "Swagger API Docs",
    href: process.env.NEXT_PUBLIC_SWAGGER_URL || "https://project-ruou.onrender.com/api/docs",
    icon: FileCode,
    isExternal: true,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isActive = (item: NavItem) => {
    if (item.isExternal) return false;
    if (item.href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/proxy";
    }
    return pathname === item.href;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-gray-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={() => setMobileSidebarOpen(false)}
        >
          {/* Common API Logo Icon */}
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
          className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Công Cụ Hệ Thống
        </div>
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          if (item.isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
                active
                  ? "bg-blue-50 text-blue-700 font-bold shadow-xs border border-blue-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    active
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
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

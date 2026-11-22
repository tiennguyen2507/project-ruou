"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe2,
  Wine,
  Clock,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

interface SubNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isNew?: boolean;
  children?: SubNavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Proxy Seeding",
    href: "/admin/proxy",
    icon: Globe2,
    badge: "API",
    isNew: true,
    children: [
      {
        label: "Lịch sử Proxy",
        href: "/admin/proxy/history",
        icon: Clock,
      },
    ],
  },
  {
    label: "Sản phẩm RuouTot",
    href: "/admin",
    icon: Wine,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});

  const toggleCollapse = (label: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCollapsedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (item: NavItem) => {
    if (item.href === "/admin/proxy") {
      return pathname === "/admin/proxy";
    }
    if (item.href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === item.href;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-gray-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={() => setMobileSidebarOpen(false)}
        >
          {/* Tikat Common Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
            >
              <path
                d="M7 9C7 7.89543 7.89543 7 9 7H23C24.1046 7 25 7.89543 25 9V11C25 11.5523 24.5523 12 24 12H18.5V23C18.5 24.1046 17.6046 25 16.5 25H15.5C14.3954 25 13.5 24.1046 13.5 23V12H8C7.44772 12 7 11.5523 7 11V9Z"
                fill="white"
              />
              <circle cx="23" cy="21" r="2.5" fill="#38BDF8" />
            </svg>
          </div>
          <div>
            <div className="font-black text-gray-900 text-lg tracking-tight leading-none flex items-center gap-1">
              <span>Tikat</span>
              <span className="text-blue-600">Common</span>
            </div>
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-blue-600 mt-1">
              API Dashboard
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isCollapsed = !!collapsedItems[item.label];

          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center">
                <Link
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
                    active
                      ? "bg-[#fff1f2] text-[#e11d48] font-bold shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active
                          ? "text-[#e11d48]"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.isNew
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => toggleCollapse(item.label, e)}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded-md transition"
                        title={isCollapsed ? "Mở rộng trang con" : "Thu gọn trang con"}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isCollapsed ? "-rotate-90 text-gray-400" : "rotate-0 text-gray-500"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </Link>
              </div>

              {/* Collapsible Children Sub-menu */}
              {hasChildren && !isCollapsed && (
                <div className="pl-5 space-y-1">
                  {item.children!.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    const SubIcon = subItem.icon;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] transition-all group ${
                          isSubActive
                            ? "bg-[#fff1f2] text-[#e11d48] font-bold shadow-2xs"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SubIcon
                            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                              isSubActive
                                ? "text-[#e11d48]"
                                : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          />
                          <span className="truncate">{subItem.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs px-2 py-1.5 text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-emerald-700">Proxy API Ready</span>
          </div>
          <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400 font-mono">
            v1.0
          </span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#ea580c] bg-white hover:bg-orange-50/50 rounded-xl border border-gray-200 transition-colors shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <Wine className="w-3.5 h-3.5 text-red-700" />
            <span>Xem Website RuouTot</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col antialiased">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -ml-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          aria-label="Mở menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            TC
          </div>
          <div className="flex items-center gap-1 font-black text-gray-900 text-base leading-none">
            <span>Tikat</span>
            <span className="text-blue-600">Common</span>
            <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1 py-0.2 rounded ml-0.5">API</span>
          </div>
        </Link>

        {/* User avatar on mobile */}
        <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 text-[#ea580c] font-black text-xs flex items-center justify-center">
          AU
        </div>
      </div>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-gray-200/80 shrink-0 sticky top-0 h-screen overflow-hidden">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

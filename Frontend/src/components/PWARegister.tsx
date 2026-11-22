"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const PWA_DISMISSED_KEY = "api_common_pwa_dismissed";

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // Kiểm tra xem người dùng đã từng tắt hoặc cài đặt trước đó chưa
    try {
      const isDismissed = localStorage.getItem(PWA_DISMISSED_KEY);
      if (isDismissed === "true") {
        return; // Đã tắt rồi thì không bao giờ hiện lại nữa
      }
    } catch {}

    // Lắng nghe sự kiện trước khi hiển thị prompt cài đặt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Kiểm tra lại localStorage trước khi hiện banner
      try {
        if (localStorage.getItem(PWA_DISMISSED_KEY) === "true") {
          return;
        }
      } catch {}

      // Hiện banner sau 3 giây (chỉ 1 lần duy nhất)
      setTimeout(() => {
        try {
          if (localStorage.getItem(PWA_DISMISSED_KEY) !== "true") {
            setShowInstallBanner(true);
          }
        } catch {
          setShowInstallBanner(true);
        }
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(PWA_DISMISSED_KEY, "true");
    } catch {}
    setShowInstallBanner(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      localStorage.setItem(PWA_DISMISSED_KEY, "true");
    } catch {}
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-bounce-once">
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-blue-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/30 font-bold text-xs">
            API
          </div>
          <div>
            <div className="font-bold text-xs text-white">Cài đặt ứng dụng API Common</div>
            <div className="text-[11px] text-gray-300">Dùng tiện lợi và mượt mà trên điện thoại</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cài</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
            title="Đóng và không hiển thị lại"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

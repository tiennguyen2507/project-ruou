"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { CheckCircle, X } from "lucide-react";

export default function NotificationToast() {
  const { toastMessage, clearToast } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#1e293b] text-white p-4 rounded-xl shadow-2xl border border-gray-700 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center space-x-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-xs font-semibold leading-snug">{toastMessage}</p>
      </div>
      <button
        onClick={clearToast}
        className="text-gray-400 hover:text-white transition p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}


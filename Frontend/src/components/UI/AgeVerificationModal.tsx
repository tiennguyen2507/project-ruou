"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AgeVerificationModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    try {
      const verified = localStorage.getItem("vang_huyphong_age_verified");
      if (!verified) {
        setIsOpen(true);
      }
    } catch (e) {
      // ignore
    }
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const handleConfirmAge = () => {
    try {
      localStorage.setItem("vang_huyphong_age_verified", "true");
    } catch (e) {}
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 bg-black text-white overflow-hidden animate-in fade-in duration-300"
    >
      {/* Background ambient gold wave effect */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-black to-black" />

      {/* Top / Center Branding: Golden Logo */}
      <div className="relative z-10 my-auto text-center flex flex-col items-center max-w-lg">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#e0bb68] via-[#c69a3c] to-[#8d6218] p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-black/40 rounded-xl flex items-center justify-center border border-amber-200/40">
              <span className="font-serif font-black text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#fff6d6] to-[#dfab3f]">
                R
              </span>
            </div>
          </div>
          <div className="text-left">
            <h1 className="font-serif font-black text-3xl md:text-4xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ffe19c] via-[#dfab3f] to-[#b37a1f]">
              RƯỢU TỐT
            </h1>
            <p className="text-xs md:text-sm font-light text-amber-200/80 tracking-widest uppercase">
              Rượu ngon dành cho người sành
            </p>
          </div>
        </div>

        {/* Warning text */}
        <p className="text-[11px] md:text-xs text-gray-400 mb-3 leading-relaxed max-w-md mx-auto">
          Điểm a khoản 1 Điều 31 Nghị định 117/2020/NĐ-CP nghiêm cấm việc bán, cung cấp thông tin về rượu bia cho người chưa đủ 18 tuổi.
        </p>

        <p className="text-xs text-amber-300/90 mb-1">
          Vui lòng cung cấp thông tin
        </p>

        <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider text-white mb-6">
          QUÝ KHÁCH ĐÃ ĐỦ 18 TUỔI?
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
          <button
            id="btn_confirm_18old"
            onClick={handleConfirmAge}
            className="w-full sm:w-auto flex-1 bg-[#a4000b] hover:bg-[#850000] text-white font-bold py-2.5 px-6 rounded text-xs uppercase tracking-wider transition shadow-lg border border-red-500/40"
          >
            ĐỦ 18 TUỔI
          </button>

          <button
            onClick={handleDecline}
            className="w-full sm:w-auto flex-1 bg-transparent hover:bg-white/10 text-gray-300 font-bold py-2.5 px-6 rounded text-xs uppercase tracking-wider transition border border-gray-600"
          >
            CHƯA 18 TUỔI
          </button>
        </div>

        <p className="text-[10px] text-gray-500 mt-6 tracking-wide">
          Website chỉ giới thiệu sản phẩm có cồn đến người trên 18 tuổi.
        </p>
      </div>
    </div>
  );
}

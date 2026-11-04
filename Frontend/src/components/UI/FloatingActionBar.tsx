"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/siteConfig";
import { Home, MapPin, MessageCircle, ArrowUp } from "lucide-react";

export default function FloatingActionBar() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Right Fixed Dock - Ruoutot exact style */}
      <aside
        aria-label="Liên hệ nhanh"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col bg-[#a4000b] rounded-l-xl shadow-2xl overflow-hidden text-white divide-y divide-red-800/60"
      >
        <Link
          href="/"
          className="flex flex-col items-center justify-center p-2.5 w-16 hover:bg-[#850000] transition group text-center"
          title="Trang chủ"
        >
          <Home className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium leading-none">Trang chủ</span>
        </Link>

        <Link
          href="/lien-he"
          className="flex flex-col items-center justify-center p-2.5 w-16 hover:bg-[#850000] transition group text-center"
          title="Hệ thống showroom"
        >
          <MapPin className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium leading-none">Cửa hàng</span>
        </Link>

        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-2.5 w-16 hover:bg-[#850000] transition group text-center"
          title="Fanpage Facebook"
        >
          <svg className="w-4 h-4 mb-0.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-[10px] font-medium leading-none">Fanpage</span>
        </a>

        <a
          href={`https://zalo.me/${siteConfig.hotline.replace(/\./g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-2.5 w-16 hover:bg-[#850000] transition group text-center bg-[#a4000b]"
          title="Chat qua Zalo"
        >
          <div className="w-4 h-4 mb-0.5 bg-white text-[#a4000b] rounded font-black text-[9px] flex items-center justify-center leading-none">
            Z
          </div>
          <span className="text-[10px] font-medium leading-none">Chat Zalo</span>
        </a>

        <a
          href="https://m.me"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-2.5 w-16 hover:bg-[#850000] transition group text-center"
          title="Messenger"
        >
          <MessageCircle className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium leading-none">Messeng...</span>
        </a>
      </aside>

      {/* Floating Scroll To Top Button - Ruoutot Red Circle */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
          className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-[#a4000b] hover:bg-[#850000] text-white rounded-full flex items-center justify-center shadow-lg transition hover:scale-110"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}


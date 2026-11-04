"use client";

import React from "react";
import Link from "next/link";
import { articlesData } from "@/data/articles";
import { Wine, Calendar, Clock, User, ArrowRight, BookOpen } from "lucide-react";

export default function WineBlogPage() {
  return (
    <div className="bg-[#fbfbfb] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b0000] bg-[#fdf2f2] px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-[#f8b4b4]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Góc Chuyên Gia Sommelier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
            Cẩm Nang & Kiến Thức Rượu Vang
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Tìm hiểu văn hóa rượu vang thế giới, nghệ thuật nếm thử, nhiệt độ phục vụ chuẩn và bí quyết kết hợp vang cùng ẩm thực Á - Âu.
          </p>
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articlesData.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="h-48 bg-gradient-to-br from-red-900/10 via-amber-900/10 to-red-900/10 flex items-center justify-center p-6 text-center">
                <Wine className="w-16 h-16 text-[#8b0000]/30" />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-bold text-[#8b0000] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-gray-900 hover:text-[#8b0000] transition line-clamp-2 leading-snug">
                    {art.title}
                  </h2>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="space-y-2 text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {art.content.slice(0, 2).map((para, i) => (
                      <p key={i} className="line-clamp-2">
                        {para}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {art.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {art.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


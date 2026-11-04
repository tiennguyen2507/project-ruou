"use client";

import React, { useState } from "react";
import { siteConfig } from "@/data/siteConfig";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#fbfbfb] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
            Liên Hệ & Hệ Thống Showroom
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Ghé thăm không gian trải nghiệm và thử nếm rượu vang trực tiếp của Huy Phong Wine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Showroom Locations */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-[#8b0000]" />
              Danh Sách Showroom Chính Thức
            </h2>

            <div className="space-y-4">
              {siteConfig.showrooms.map((s, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition ${
                    s.isHeadquarters ? "border-[#8b0000] ring-1 ring-[#8b0000]/20" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#8b0000]" />
                      {s.name}
                    </h3>
                    {s.isHeadquarters && (
                      <span className="bg-[#8b0000] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Trụ sở chính
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {s.address}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <a
                      href={`tel:${s.phone}`}
                      className="flex items-center gap-1 text-[#8b0000] font-bold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{s.phone}</span>
                    </a>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{s.hours}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Corporate Info */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 text-xs text-amber-900 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8b0000]" />
                Thông Tin Pháp Nhân Doanh Nghiệp
              </h4>
              <p>Tên công ty: <strong>{siteConfig.companyName}</strong></p>
              <p>Mã số doanh nghiệp (MST): <strong>{siteConfig.taxCode}</strong> do Sở Kế hoạch & Đầu tư TP. Hà Nội cấp.</p>
              <p>{siteConfig.licenseNumber}</p>
              <p>Email liên hệ đại lý & đối tác: <strong>{siteConfig.email}</strong></p>
            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Gửi Tin Nhắn Tư Vấn Trực Tuyến
            </h2>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2 text-xs">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-800">
                  Gửi Yêu Cầu Thành Công!
                </h4>
                <p className="text-gray-600">
                  Chuyên viên tư vấn của Vang Huy Phong sẽ phản hồi qua điện thoại hoặc email trong vòng 15 phút.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-[#8b0000] font-bold underline"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Họ và tên của bạn:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#8b0000]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Số điện thoại / Zalo:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#8b0000]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Chủ đề tư vấn:
                  </label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#8b0000]">
                    <option>Tư vấn chọn rượu vang tiệc / gia đình</option>
                    <option>Báo giá quà Tết doanh nghiệp</option>
                    <option>Hợp tác đại lý phân phối</option>
                    <option>Hỏi thông tin về chai vang Chile Carmenere</option>
                    <option>Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nội dung lời nhắn:
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Quý khách vui lòng để lại số lượng hoặc yêu cầu cụ thể..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-[#8b0000]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#8b0000] hover:bg-[#720b18] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Tin Nhắn Ngay</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


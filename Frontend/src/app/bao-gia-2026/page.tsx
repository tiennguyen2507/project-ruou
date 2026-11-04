"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WineProduct, fetchAllProducts } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import {
  FileText,
  Download,
  Printer,
  Search,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Phone,
  CheckCircle,
  Building,
} from "lucide-react";

export default function PriceListPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<WineProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchAllProducts(200).then((data) => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  const categories = [
    { id: "all", label: `Tất cả sản phẩm (${products.length || 111})` },
    { id: "Chile", label: "🇨🇱 Vang Chile" },
    { id: "Ý", label: "🇮🇹 Vang Ý" },
    { id: "Pháp", label: "🇫🇷 Vang Pháp" },
    { id: "Champagne", label: "🍾 Champagne & Vang Sủi" },
    { id: "Tây Ban Nha", label: "🇪🇸 Tây Ban Nha" },
    { id: "Úc", label: "🇦🇺 Vang Úc" },
    { id: "0%", label: "🟢 Vang 0.0% & Cocktail" },
  ];

  const filteredItems = useMemo(() => {
      return products.filter((p) => {
        // Tab filter
        if (activeTab === "Chile" && p.country !== "Chile") return false;
        if (activeTab === "Ý" && p.country !== "Ý") return false;
        if (activeTab === "Pháp" && p.country !== "Pháp") return false;
        if (activeTab === "Champagne" && p.wineType !== "Champagne & Sủi") return false;
        if (activeTab === "Tây Ban Nha" && p.country !== "Tây Ban Nha") return false;
        if (activeTab === "Úc" && p.country !== "Úc") return false;
        if (activeTab === "0%" && p.alcoholNumeric !== 0 && !p.category.includes("Cocktail")) return false;

        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.originalName.toLowerCase().includes(q) ||
            p.region.toLowerCase().includes(q) ||
            p.classification.toLowerCase().includes(q) ||
            p.grapes.some((g) => g.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      });
    }, [activeTab, searchTerm]);

    return (
      <div className="bg-[#fbfbfb] py-8">
        {/* Google PriceSpecification JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Bảng Báo Giá Rượu Vang Niêm Yết 2026 — Công Ty CP Huy Phong",
              description:
                "Tra cứu bảng giá niêm yết bán lẻ & nguyên thùng 111+ dòng rượu vang Chile, Pháp, Ý, Tây Ban Nha, Úc chính hãng 2026. Tải PDF chính thức.",
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://project-ruou.onrender.com"}/bao-gia-2026`,
            }),
          }}
        />
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          {/* Document Header Card */}
          <div className="bg-gradient-to-r from-[#4a0606] via-[#720b18] to-[#4a0606] text-white p-6 sm:p-8 rounded-3xl shadow-lg border-2 border-[#d4af37]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 bg-[#d4af37] text-[#4a0c0c] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>PRICE LIST 2026 — PHIÊN BẢN: 17082026</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-tight">
                  BẢNG BÁO GIÁ RƯỢU VANG NHẬP KHẨU 2026
                </h1>

                <div className="text-xs text-gray-200 space-y-1">
                  <p className="font-semibold text-[#f9d776]">
                    {siteConfig.companyName}
                  </p>
                  <p>
                    Địa chỉ: 58B, phố Võ Văn Dũng, phường Ô Chợ Dừa, Đống Đa, Hà Nội | Hotline: {siteConfig.hotlineDisplay}
                  </p>
                  <p className="text-[#f9d776]/90 text-[11px]">
                    ✓ Giá trên đã bao gồm thuế VAT (VAT included) • Hiệu lực (Valid): 31/03/2027
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/BAO GIA 2026 - SHOP 170826.pdf"
                  download="BAO_GIA_2026_VANG_HUY_PHONG.pdf"
                  className="bg-[#d4af37] hover:bg-[#e6c257] text-[#4a0c0c] font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Báo Giá PDF Gốc</span>
                </a>

                <button
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition border border-white/20 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Bảng Giá</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 text-xs font-bold">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveTab(c.id)}
                  className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${activeTab === c.id
                      ? "bg-[#8b0000] text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tra cứu tên rượu, giống nho, vùng..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-[#8b0000]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3" />
            </div>
          </div>

          {/* Interactive Data Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#8b0000] text-white uppercase tracking-wider font-bold border-b border-[#720b18]">
                    <th className="py-3.5 px-4 w-12 text-center">STT</th>
                    <th className="py-3.5 px-4">Vùng & Xuất Xứ</th>
                    <th className="py-3.5 px-4">Tên Rượu & Giống Nho</th>
                    <th className="py-3.5 px-3 text-center">Đẳng Cấp</th>
                    <th className="py-3.5 px-3 text-center">Nồng Độ</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Đặc Điểm Thử Nếm</th>
                    <th className="py-3.5 px-4 text-right">Đơn Giá (VNĐ)</th>
                    <th className="py-3.5 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-red-50/50 transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                    >
                      <td className="py-3 px-4 text-center text-gray-400 font-semibold">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{p.region}</div>
                        <div className="text-[10px] text-gray-500">{p.country}</div>
                        <div className="text-[10px] text-gray-400">Trang PDF: {p.pdfPage}</div>
                      </td>

                      <td className="py-3 px-4">
                        <Link
                          href={`/san-pham/${p.slug}`}
                          className="font-bold text-gray-900 hover:text-[#8b0000] transition line-clamp-2"
                        >
                          {p.name}
                        </Link>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          🍇 {p.grapes.join(", ")}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-red-50 text-[#8b0000] font-bold text-[10px] px-2 py-0.5 rounded border border-red-100 whitespace-nowrap">
                          {p.classification}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-gray-800">
                        {p.alcohol}
                      </td>

                      <td className="py-3 px-4 text-gray-600 text-[11px] leading-relaxed">
                        {p.tastingNotes.raw}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-black text-[#8b0000] text-sm whitespace-nowrap">
                          {formatPrice(p.price)}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Thùng 6: {formatPrice(p.casePrice)}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="p-1.5 bg-[#8b0000] hover:bg-[#720b18] text-white rounded-lg transition"
                            title="Thêm vào giỏ"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/san-pham/${p.slug}`}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            title="Xem chi tiết"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-amber-700" />
              Lưu ý quan trọng về chính sách giá năm 2026:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Đơn giá trên đã bao gồm thuế Giá trị gia tăng (VAT 10%).</li>
              <li>Khách hàng lấy nguyên thùng (thùng 6 chai) được áp dụng giá ưu đãi giảm 10% và miễn phí vận chuyển.</li>
              <li>Đơn hàng đại lý, nhà hàng, khách sạn hoặc quà tặng doanh nghiệp số lượng lớn xin vui lòng liên hệ trực tiếp hotline <strong>{siteConfig.hotlineDisplay}</strong> để nhận bảng chiết khấu riêng biệt.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }


"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Wine,
  RefreshCw,
  Globe2,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Package,
} from "lucide-react";
import { ProductItem, getProducts } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

function AdminProductsContent() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "inStock" | "outStock">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProductList = async () => {
    try {
      setRefreshing(true);
      const res = await getProducts({ limit: 100 });
      if (res && res.data) {
        setProducts(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi tải danh sách sản phẩm", "error");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, []);

  // Filter products by search and stock status
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filterStock === "inStock" && !p.inStock) return false;
      if (filterStock === "outStock" && p.inStock) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.country && p.country.toLowerCase().includes(q)) ||
          (p.wineType && p.wineType.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [products, search, filterStock]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const inStockCount = useMemo(() => products.filter((p) => p.inStock).length, [products]);
  const outStockCount = products.length - inStockCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-once">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === "success"
                ? "bg-emerald-900/95 text-emerald-100 border-emerald-700"
                : "bg-red-900/95 text-red-100 border-red-700"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Wine className="w-6 h-6 text-red-700" />
            <span>Quản lý Sản phẩm RuouTot</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Bảng giá niêm yết 2026, tồn kho và danh mục rượu vang RuouTot
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/proxy"
            className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-[#ea580c] px-3.5 py-2 rounded-xl text-xs font-bold border border-orange-200/60 transition shadow-2xs"
          >
            <Globe2 className="w-4 h-4" />
            <span>Proxy Seeding Tool</span>
          </Link>
          <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 text-[#ea580c] font-black text-xs flex items-center justify-center shadow-2xs">
            AU
          </div>
        </div>
      </div>

      {/* Quick Switch Banner to Proxy Seeding */}
      <div className="bg-gradient-to-r from-orange-500 to-[#ea580c] rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base">
                Proxy Seeding & URL Redirect Tool
              </span>
              <span className="bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                API
              </span>
            </div>
            <p className="text-xs text-orange-100 mt-0.5">
              Hỗ trợ kiểm tra link rút gọn qua SOCKS5 proxy, trích xuất IP đầu ra và lấy URL đích cuối cùng.
            </p>
          </div>
        </div>

        <Link
          href="/admin/proxy"
          className="flex items-center gap-2 bg-white hover:bg-orange-50 text-[#ea580c] px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <span>Mở Proxy Tool</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Products Management Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Card Header Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              Kho Rượu Vang RuouTot
            </h2>
            <span className="bg-[#ffedd5] text-[#ea580c] font-bold text-xs px-2.5 py-0.5 rounded-full border border-orange-200/60">
              Tổng {products.length} sản phẩm
            </span>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => {
                  setFilterStock("all");
                  setCurrentPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition ${
                  filterStock === "all"
                    ? "bg-gray-900 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tất cả ({products.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterStock("inStock");
                  setCurrentPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition ${
                  filterStock === "inStock"
                    ? "bg-[#059669] text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Còn hàng ({inStockCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterStock("outStock");
                  setCurrentPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition ${
                  filterStock === "outStock"
                    ? "bg-red-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Hết hàng ({outStockCount})
              </button>
            </div>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm tên vang, SKU, quốc gia..."
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
              />
            </div>

            <button
              onClick={fetchProductList}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition shrink-0"
              title="Làm mới danh sách"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Product List Rows */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#ea580c]" />
            <span>Đang tải danh sách sản phẩm RuouTot...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-2">
            <Package className="w-8 h-8 text-gray-300" />
            <span>Không tìm thấy sản phẩm nào phù hợp</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginatedProducts.map((p) => (
              <div
                key={p._id}
                className="p-3.5 sm:p-4 hover:bg-gray-50/70 transition flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 font-bold flex items-center justify-center shrink-0">
                    <Wine className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-bold text-gray-900 truncate">
                      {p.name}
                    </div>
                    <div className="text-gray-400 text-[11px] flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[#ea580c] font-semibold">
                        {p.sku}
                      </span>
                      <span>•</span>
                      <span>{p.country || "Nhập khẩu"}</span>
                      {p.wineType && (
                        <>
                          <span>•</span>
                          <span>{p.wineType}</span>
                        </>
                      )}
                      {p.volume && (
                        <>
                          <span>•</span>
                          <span>{p.volume}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      p.inStock
                        ? "bg-[#d1fae5] text-[#059669]"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {p.inStock ? "Còn hàng" : "Hết hàng"}
                  </span>
                  <div className="font-bold text-gray-900 text-xs sm:text-sm">
                    {formatPrice(p.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredProducts.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredProducts.length)} trên tổng số{" "}
              {filteredProducts.length} sản phẩm
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      currentPage === pageNum
                        ? "bg-[#ea580c] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-1 text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      currentPage === totalPages
                        ? "bg-[#ea580c] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-400 text-sm">
          Đang tải bảng điều khiển...
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}

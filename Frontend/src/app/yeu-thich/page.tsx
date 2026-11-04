"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WineProduct, fetchAllProducts } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/Product/ProductCard";
import { Heart, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<WineProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts(200).then((data) => {
      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  const favoriteProducts = products.filter((p) =>
    wishlistIds.includes(p.id) || (p._id && wishlistIds.includes(p._id))
  );

  return (
    <div className="bg-[#fbfbfb] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#8b0000] fill-current" />
            <span>Danh Sách Vang Yêu Thích ({favoriteProducts.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Những chai vang bạn đã lưu lại để tham khảo và đặt mua.
          </p>
        </div>

        {isLoading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#8b0000] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm max-w-md mx-auto space-y-4">
            <Heart className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">
              Chưa có chai vang nào trong danh sách yêu thích
            </h3>
            <p className="text-xs text-gray-500">
              Nhấn vào biểu tượng trái tim ở góc các sản phẩm bạn quan tâm để lưu lại tại đây.
            </p>
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-2 bg-[#8b0000] hover:bg-[#720b18] text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase transition shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Khám Phá Sản Phẩm Ngay</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoriteProducts.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

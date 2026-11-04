"use client";

import React from "react";
import Link from "next/link";
import { WineProduct } from "@/data/products";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: WineProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group/card border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition duration-300 h-full flex flex-col justify-between bg-white relative hover:border-[#b30000]/40"
    >
      {/* Top badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
        {product.discountPercent > 0 && (
          <span className="bg-[#b30000] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
            -{product.discountPercent}%
          </span>
        )}
        {product.badge && (
          <span className="bg-[#d4af37] text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {product.badge}
          </span>
        )}
      </div>

      {/* Bottle Image - aspect 4/5 */}
      <div className="relative w-full aspect-[4/5] bg-white overflow-hidden flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover/card:scale-105 transition duration-500 filter drop-shadow-md"
          loading="lazy"
        />
      </div>

      {/* Product Information */}
      <div className="p-3 md:p-4 flex flex-col flex-grow text-left border-t border-gray-100">
        <h3 className="text-[14px] md:text-[15px] font-serif font-semibold text-gray-800 leading-snug mb-2 group-hover/card:text-[#b30000] transition line-clamp-2 h-[40px] md:h-[44px]">
          {product.name}
        </h3>

        <div className="text-[11px] md:text-xs text-gray-500 mb-2 mt-auto flex items-center justify-between">
          <span>Nồng độ: {product.alcohol} ABV*</span>
          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            {product.country}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div className="text-[15px] md:text-base font-bold text-[#b30000]">
            {formatPrice(product.price)}
          </div>
          {product.originalPrice > product.price && (
            <div className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

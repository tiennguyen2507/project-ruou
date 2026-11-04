"use client";

import React, { useState } from "react";
import { WineProduct } from "@/data/products";
import { ShieldCheck, Award, ZoomIn, Sparkles } from "lucide-react";

interface ProductGalleryProps {
  product: WineProduct;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(product.image);

  // Gallery images list
  const galleryImages = [
    product.image,
    "/images/products/wine-bottle-1.png",
    "/images/products/wine-bottle-4.png",
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 order-2 md:order-1">
        {galleryImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`w-16 h-20 bg-gray-50 rounded-lg p-1 border-2 transition ${
              selectedImage === img
                ? "border-[#8b0000] shadow-sm bg-white"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={`${product.name} thumb ${idx}`}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      {/* Main Image View */}
      <div className="order-1 md:order-2 flex-1 w-full bg-gradient-to-b from-gray-50 via-white to-gray-50 rounded-2xl border border-gray-200 p-8 flex items-center justify-center relative overflow-hidden group shadow-sm min-h-[460px]">
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <span className="bg-[#8b0000] text-white text-xs font-black px-2.5 py-1 rounded shadow">
            -{product.discountPercent}% OFF
          </span>
          {product.badge && (
            <span className="bg-[#d4af37] text-[#4a0c0c] text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow">
              {product.badge}
            </span>
          )}
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
            Chính Ngạch CO/CQ
          </span>
        </div>

        {/* Vintage Seal */}
        <div className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full border-2 border-[#d4af37] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-[10px] text-[#8b0000] font-black shadow">
          <span>NIÊN VỤ</span>
          <span className="font-extrabold">{product.vintage}</span>
        </div>

        {/* Wine Bottle Image */}
        <div className="h-96 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt={product.name}
            className="h-full object-contain filter drop-shadow-xl"
          />
        </div>

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 text-gray-400 text-xs flex items-center gap-1 bg-white/80 px-2 py-1 rounded">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Hình ảnh bản quyền Huy Phong</span>
        </div>
      </div>
    </div>
  );
}


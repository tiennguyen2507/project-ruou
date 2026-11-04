"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 bg-[#8b0000] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#f9d776]" />
              <h3 className="font-bold text-base uppercase tracking-wider">
                Giỏ Hàng Của Bạn ({totalItems})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Đóng giỏ hàng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Free Shipping Bar */}
          <div className="bg-amber-50 p-3 border-b border-amber-100 text-xs text-amber-900 flex items-center justify-between">
            {totalPrice >= 1500000 ? (
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                🎉 Bạn được MIỄN PHÍ VẬN CHUYỂN hỏa tốc nội thành!
              </span>
            ) : (
              <span>
                Mua thêm <strong>{formatPrice(1500000 - totalPrice)}</strong> để được Miễn phí giao hàng 2h!
              </span>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-3" />
                <p className="text-base font-semibold text-gray-700">
                  Giỏ hàng của bạn đang trống
                </p>
                <p className="text-xs text-gray-400 mt-1 mb-6">
                  Hãy khám phá danh mục rượu vang nhập khẩu chính hãng của chúng tôi.
                </p>
                <button
                  onClick={closeCart}
                  className="bg-[#8b0000] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#720b18] transition"
                >
                  Tiếp Tục Mua Sắm
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-3 items-center">
                  <div className="w-14 h-20 bg-gray-50 rounded flex items-center justify-center p-1 border flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {product.country} • {product.alcohol}
                    </p>
                    <div className="text-xs font-extrabold text-[#8b0000] mt-1">
                      {formatPrice(product.price)}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-gray-500 hover:text-black transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 text-gray-500 hover:text-black transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-gray-900">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-extrabold text-base text-[#8b0000]">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                Đã bao gồm thuế GTGT (VAT 10%) • Chưa bao gồm phí vận chuyển
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/gio-hang"
                  onClick={closeCart}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider text-center transition shadow-sm"
                >
                  Xem Giỏ Hàng
                </Link>
                <Link
                  href="/thanh-toan"
                  onClick={closeCart}
                  className="w-full bg-[#8b0000] hover:bg-[#720b18] text-white font-bold py-2.5 px-3 rounded-lg text-xs uppercase tracking-wider text-center transition shadow-md flex items-center justify-center space-x-1"
                >
                  <span>Thanh Toán</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


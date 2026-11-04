"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");
    if (promoCode.trim().toUpperCase() === "HUYPHONG2026") {
      setDiscountPercent(5);
      setPromoSuccess("Áp dụng mã giảm giá 5% thành công!");
    } else if (promoCode.trim().toUpperCase() === "CARMENERE") {
      setDiscountPercent(10);
      setPromoSuccess("Áp dụng mã tri ân khách hàng Carmenere 10% thành công!");
    } else {
      setPromoError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
  };

  const discountAmount = Math.round((totalPrice * discountPercent) / 100);
  const finalPrice = Math.max(0, totalPrice - discountAmount);
  const freeShipThreshold = 1500000;
  const isFreeShip = totalPrice >= freeShipThreshold;
  const shipRemaining = Math.max(0, freeShipThreshold - totalPrice);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-serif font-black text-gray-900 mb-2">
          Giỏ Hàng Của Bạn Đang Trống
        </h1>
        <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
          Hiện tại chưa có sản phẩm rượu vang nào trong giỏ hàng. Hãy khám phá bảng báo giá 2026 với hơn 110 dòng vang thượng hạng.
        </p>
        <Link
          href="/san-pham"
          className="inline-flex items-center gap-2 bg-[#8b0000] hover:bg-[#720b18] text-white font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Khám Phá Rượu Vang Ngay</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
            Giỏ Hàng ({totalItems} sản phẩm)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kiểm tra lại danh sách các chai vang đã chọn trước khi tiến hành thanh toán.
          </p>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-xs">
          {isFreeShip ? (
            <div className="text-emerald-700 font-bold flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Đơn hàng của bạn đủ điều kiện MIỄN PHÍ VẬN CHUYỂN hỏa tốc trong 2 giờ!</span>
            </div>
          ) : (
            <div className="text-amber-900">
              Mua thêm <strong>{formatPrice(shipRemaining)}</strong> để nhận ưu đãi <strong>Freeship hỏa tốc 2h</strong> nội thành!
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#8b0000] h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (totalPrice / freeShipThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Content: Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-xs uppercase text-gray-600 flex justify-between items-center">
              <span>Sản phẩm</span>
              <button
                onClick={clearCart}
                className="text-gray-400 hover:text-red-600 text-xs normal-case flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa giỏ hàng</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100 p-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center gap-4"
                >
                  {/* Bottle Image */}
                  <div className="w-20 h-28 bg-gray-50 rounded-xl p-2 border flex items-center justify-center flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <Link
                      href={`/san-pham/${product.slug}`}
                      className="font-bold text-sm text-gray-900 hover:text-[#8b0000] transition line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      {product.country} • {product.region} • {product.alcohol}
                    </div>
                    <div className="text-xs font-semibold text-[#8b0000] mt-1">
                      Đơn giá: {formatPrice(product.price)}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Subtotal */}
                  <div className="text-right flex-shrink-0 min-w-[100px]">
                    <div className="text-sm font-black text-[#8b0000]">
                      {formatPrice(product.price * quantity)}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-gray-400 hover:text-red-600 transition p-1"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs">
              <Link
                href="/san-pham"
                className="flex items-center gap-1.5 font-bold text-[#8b0000] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Tiếp tục chọn thêm rượu vang</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-4">
            {/* Promo Voucher Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#8b0000]" />
                Mã Giảm Giá / Ưu Đãi
              </h3>
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Nhập HUYPHONG2026..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium focus:outline-none focus:border-[#8b0000]"
                />
                <button
                  type="submit"
                  className="bg-[#8b0000] hover:bg-[#720b18] text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Áp Dụng
                </button>
              </form>
              {promoSuccess && (
                <p className="text-[11px] text-emerald-600 font-semibold">
                  ✓ {promoSuccess}
                </p>
              )}
              {promoError && (
                <p className="text-[11px] text-red-600 font-semibold">
                  ✗ {promoError}
                </p>
              )}
              <div className="text-[10px] text-gray-400">
                Gợi ý: Nhập mã <strong>HUYPHONG2026</strong> (giảm 5%) hoặc <strong>CARMENERE</strong> (giảm 10%).
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 border-b pb-2">
                Tóm Tắt Đơn Hàng
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng tiền hàng ({totalItems} chai):</span>
                  <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Chiết khấu ({discountPercent}%):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-emerald-700">
                    {isFreeShip ? "MIỄN PHÍ (Hỏa tốc)" : "30.000 đ"}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Thuế GTGT (VAT 10%):</span>
                  <span className="text-gray-500 font-medium">Đã bao gồm trong giá</span>
                </div>

                <div className="border-t pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Tổng thanh toán:</span>
                  <span className="text-xl font-black text-[#8b0000]">
                    {formatPrice(finalPrice + (isFreeShip ? 0 : 30000))}
                  </span>
                </div>
              </div>

              <Link
                href="/thanh-toan"
                className="w-full bg-[#8b0000] hover:bg-[#720b18] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider text-center transition shadow-md flex items-center justify-center space-x-2"
              >
                <span>Tiến Hành Đặt Hàng</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


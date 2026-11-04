"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/data/siteConfig";
import { formatPrice } from "@/lib/utils";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle,
  Building,
  QrCode,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, totalItems } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hà Nội");
  const [district, setDistrict] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank" | "pos">("cod");

  // VAT Invoice checkbox
  const [needVat, setNeedVat] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // Order placed status
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  const isFreeShip = totalPrice >= 1500000;
  const shippingFee = isFreeShip ? 0 : 30000;
  const grandTotal = totalPrice + shippingFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.");
      return;
    }
    const code = "HP-" + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(code);
    setIsOrderPlaced(true);
    clearCart();
  };

  if (isOrderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Đặt Hàng Thành Công
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">
              Cảm Ơn Quý Khách Đã Đặt Hàng!
            </h1>
            <p className="text-xs text-gray-600">
              Mã đơn hàng của bạn là: <strong className="text-[#8b0000] text-sm">{orderCode}</strong>
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 text-left text-xs space-y-2 text-gray-700">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Khách hàng:</span>
              <span className="font-bold">{fullName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Số điện thoại:</span>
              <span className="font-bold">{phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Địa chỉ giao:</span>
              <span className="font-bold text-right">{address}, {city}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Phương thức thanh toán:</span>
              <span className="font-bold">
                {paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : paymentMethod === "bank"
                  ? "Chuyển khoản ngân hàng VietQR"
                  : "Quẹt thẻ POS"}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-sm font-bold text-gray-900">Tổng tiền thanh toán:</span>
              <span className="text-base font-black text-[#8b0000]">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          {paymentMethod === "bank" && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-center space-y-3">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                <QrCode className="w-4 h-4 text-[#8b0000]" />
                <span>Thông Tin Chuyển Khoản Ngân Hàng (VietQR)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border inline-block text-xs font-mono">
                <p>Ngân hàng: <strong>MBBank (Ngân hàng Quân Đội)</strong></p>
                <p>Số tài khoản: <strong>0876736886</strong></p>
                <p>Chủ tài khoản: <strong>CONG TY CO PHAN HUY PHONG</strong></p>
                <p>Nội dung chuyển khoản: <strong className="text-[#8b0000]">{orderCode}</strong></p>
              </div>
              <p className="text-[11px] text-gray-500">
                Đơn hàng sẽ được nhân viên Huy Phong kiểm tra và giao hỏa tốc ngay khi nhận được thanh toán.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 leading-relaxed">
            Chuyên viên tư vấn của Huy Phong sẽ liên hệ với bạn trong vòng 10 phút để xác nhận thời gian giao hàng chính xác.
          </p>

          <Link
            href="/"
            className="inline-block bg-[#8b0000] hover:bg-[#720b18] text-white font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
          >
            Về Trang Chủ Mua Sắm
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Bạn chưa có sản phẩm nào trong giỏ hàng để thanh toán.
        </p>
        <Link
          href="/san-pham"
          className="bg-[#8b0000] text-white py-2.5 px-6 rounded-xl text-xs font-bold uppercase"
        >
          Chọn Rượu Vang Ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
            Thông Tin Thanh Toán & Giao Hàng
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Giao hàng hỏa tốc trong 2 giờ nội thành Hà Nội & TP. Hồ Chí Minh
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Contact */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#8b0000]" />
                1. Thông Tin Người Nhận Hàng
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Họ và tên người nhận <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#8b0000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#8b0000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Địa chỉ email (để nhận hóa đơn điện tử):
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#8b0000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tỉnh / Thành phố:
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#8b0000]"
                  >
                    <option value="Hà Nội">Hà Nội (Giao trong 2h)</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh (Giao trong 2h)</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Quảng Ninh">Quảng Ninh</option>
                    <option value="Khác">Các tỉnh thành khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quận / Huyện:
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Đống Đa, Cầu Giấy, Quận 1..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#8b0000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Địa chỉ số nhà, tên đường <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số 58B Võ Văn Dũng..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#8b0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ghi chú đơn hàng (nếu có):
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Giao giờ hành chính, gọi điện trước khi giao, túi hộp quà Tết..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#8b0000]"
                />
              </div>
            </div>

            {/* VAT Invoice option */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-800">
                <input
                  type="checkbox"
                  checked={needVat}
                  onChange={(e) => setNeedVat(e.target.checked)}
                  className="rounded text-[#8b0000] focus:ring-[#8b0000]"
                />
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#8b0000]" />
                  Yêu cầu xuất Hóa đơn Giá trị gia tăng (VAT 10%) cho công ty
                </span>
              </label>

              {needVat && (
                <div className="pt-3 border-t space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Tên công ty:</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="CÔNG TY CỔ PHẦN..."
                      className="w-full bg-gray-50 border rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">Mã số thuế:</label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="0108..."
                        className="w-full bg-gray-50 border rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">Địa chỉ đăng ký:</label>
                      <input
                        type="text"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="Địa chỉ theo GPKD..."
                        className="w-full bg-gray-50 border rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#8b0000]" />
                2. Phương Thức Thanh Toán
              </h2>

              <div className="space-y-2 text-xs">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentMethod === "cod"
                      ? "border-[#8b0000] bg-red-50/40"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-0.5 text-[#8b0000] focus:ring-[#8b0000]"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      Kiểm tra tem nhãn và sản phẩm trước khi thanh toán tiền mặt cho shipper.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentMethod === "bank"
                      ? "border-[#8b0000] bg-red-50/40"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "bank"}
                    onChange={() => setPaymentMethod("bank")}
                    className="mt-0.5 text-[#8b0000] focus:ring-[#8b0000]"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                      Chuyển khoản ngân hàng trực tuyến 24/7 (VietQR)
                      <span className="bg-[#8b0000] text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                        Khuyên Dùng
                      </span>
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      Quét mã QR chuyển khoản nhanh qua mọi ứng dụng ngân hàng.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    paymentMethod === "pos"
                      ? "border-[#8b0000] bg-red-50/40"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "pos"}
                    onChange={() => setPaymentMethod("pos")}
                    className="mt-0.5 text-[#8b0000] focus:ring-[#8b0000]"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">
                      Quẹt thẻ Visa / Master / Napas khi nhận hàng
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      Nhân viên giao hàng mang theo máy POS cầm tay tận nơi.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Confirm Button */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 border-b pb-2 flex justify-between">
              <span>Đơn Hàng Của Bạn</span>
              <span className="text-[#8b0000]">{totalItems} chai</span>
            </h3>

            {/* Items snippet */}
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-700 flex-shrink-0">
                      {quantity}x
                    </span>
                    <span className="truncate font-medium text-gray-800">
                      {product.name}
                    </span>
                  </div>
                  <span className="font-bold text-[#8b0000] flex-shrink-0">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính tiền rượu:</span>
                <span className="font-bold text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-emerald-700">
                  {isFreeShip ? "Miễn phí (Hỏa tốc 2h)" : "30.000 đ"}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Thuế GTGT (VAT 10%):</span>
                <span className="text-gray-500 font-medium">Đã bao gồm trong giá</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Tổng thanh toán:</span>
                <span className="text-2xl font-black text-[#8b0000]">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-[#8b0000] hover:bg-[#720b18] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-[#f9d776]" />
              <span>Xác Nhận Đặt Hàng Ngay</span>
            </button>

            {/* Trust note */}
            <div className="pt-2 text-[11px] text-gray-500 space-y-1.5 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Rượu vang chính hãng, đền 1000% nếu phát hiện giả mạo</span>
              </div>
              <p>Hotline hỗ trợ đơn hàng: <strong className="text-[#8b0000]">{siteConfig.hotlineDisplay}</strong></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


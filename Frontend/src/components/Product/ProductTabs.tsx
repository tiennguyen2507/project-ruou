"use client";

import React, { useState } from "react";
import { WineProduct } from "@/data/products";
import {
  FileText,
  Wine,
  Utensils,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  Thermometer,
} from "lucide-react";

interface ProductTabsProps {
  product: WineProduct;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "desc" | "tasting" | "serving" | "reviews"
  >("desc");

  // Sample verified reviews
  const reviews = [
    {
      id: 1,
      name: "Nguyễn Văn Hùng",
      role: "Khách hàng mua thùng tại Hà Nội",
      rating: 5,
      date: "02/11/2026",
      comment: `Tôi mua chai ${product.name} này dùng trong tiệc sinh nhật gia đình. Rượu rót ra màu rất đẹp, thơm mùi trái cây chín và gỗ sồi. Tannin êm mượt, vị đầm ấm ai cũng khen. Dịch vụ giao hàng của Huy Phong rất nhanh, đúng 1 tiếng rưỡi là nhận được hàng kèm túi hộp rất lịch sự.`,
    },
    {
      id: 2,
      name: "Trần Anh Tuấn",
      role: "Khách hàng thân thiết",
      rating: 5,
      date: "25/10/2026",
      comment: `Vang chuẩn chính hãng, có tem nhãn phụ hải quan và hóa đơn VAT đầy đủ cho công ty. So với giá thị trường thì giá ở Báo giá 2026 của Huy Phong tốt hơn đáng kể, nhất là khi lấy nguyên thùng 6 chai.`,
    },
    {
      id: 3,
      name: "Lê Hoàng Yến",
      role: "Người sành vang",
      rating: 5,
      date: "14/10/2026",
      comment: `Để thở khoảng 30 phút trong decanter thì hương thơm bung tỏa rất mạnh mẽ. Kết hợp với bò sốt tiêu đen thì đỉnh cao luôn! Sẽ tiếp tục ủng hộ Vang Huy Phong.`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm my-8">
      {/* Tab Navigation Buttons */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/70">
        <button
          onClick={() => setActiveTab("desc")}
          className={`flex items-center space-x-2 py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "desc"
              ? "border-[#8b0000] text-[#8b0000] bg-white"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Thông Tin Sản Phẩm</span>
        </button>

        <button
          onClick={() => setActiveTab("tasting")}
          className={`flex items-center space-x-2 py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "tasting"
              ? "border-[#8b0000] text-[#8b0000] bg-white"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Wine className="w-4 h-4" />
          <span>Hương Vị & Tasting Notes</span>
        </button>

        <button
          onClick={() => setActiveTab("serving")}
          className={`flex items-center space-x-2 py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "serving"
              ? "border-[#8b0000] text-[#8b0000] bg-white"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Thưởng Thức & Phục Vụ</span>
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center space-x-2 py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
            activeTab === "reviews"
              ? "border-[#8b0000] text-[#8b0000] bg-white"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Đánh Giá ({reviews.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 md:p-8 text-sm text-gray-700 leading-relaxed">
        {activeTab === "desc" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 font-serif">
              Giới thiệu tổng quan về {product.name}
            </h3>

            <p>
              <strong>{product.name}</strong> là một trong những tuyệt phẩm rượu vang danh tiếng đến từ vùng làm vang trứ danh <strong>{product.region}</strong> của quốc gia <strong>{product.country}</strong>. Sản phẩm được sản xuất dưới tiêu chuẩn kiểm định nghiêm ngặt của phân hạng <strong>{product.classification}</strong>, kết tinh nghệ thuật ủ rượu lâu đời kết hợp cùng thổ nhưỡng và khí hậu hoàn hảo.
            </p>

            <div className="bg-[#fdf2f2] p-4 rounded-xl border border-[#f8b4b4] my-4">
              <h4 className="font-bold text-[#8b0000] text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Mô tả đặc tính thử nếm từ Báo Giá 2026:
              </h4>
              <p className="text-gray-800 text-xs italic leading-relaxed">
                "{product.tastingNotes.raw}"
              </p>
            </div>

            <p>
              Với nồng độ cồn cân bằng <strong>{product.alcohol}</strong> và niên vụ tuyển chọn <strong>{product.vintage}</strong>, chai vang đem đến trải nghiệm đẳng cấp ngay từ giọt rượu đầu tiên. Sản phẩm được Công ty Cổ phần Huy Phong nhập khẩu trực tiếp nguyên chai, bảo quản trong hệ thống hầm rượu kiểm soát nhiệt độ 16-18°C tiêu chuẩn quốc tế, bảo lưu trọn vẹn hương vị tươi ngon và tiềm năng lão hóa tốt nhất.
            </p>

            <h4 className="text-base font-bold text-gray-900 font-serif mt-6">
              Tại sao nên chọn mua tại Vang Huy Phong?
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li>Cam kết 100% hàng nhập khẩu chính ngạch, có tem hải quan và chứng nhận xuất xứ CO/CQ.</li>
              <li>Mức giá niêm yết cạnh tranh theo Báo giá 2026 chính hãng, đã bao gồm thuế VAT 10%.</li>
              <li>Chiết khấu hấp dẫn cho khách hàng mua số lượng lớn hoặc doanh nghiệp đặt quà tặng đối tác.</li>
              <li>Giao hàng hỏa tốc trong 2 giờ tại khu vực nội thành Hà Nội và TP. Hồ Chí Minh.</li>
              <li>Được tư vấn chi tiết bởi đội ngũ Sommelier được đào tạo bài bản.</li>
            </ul>
          </div>
        )}

        {activeTab === "tasting" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">
              Hương Vị & Ghi Chú Thử Nếm (Tasting Notes)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs font-bold text-[#8b0000] uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#8b0000]" />
                  Màu Sắc & Độ Sánh (Color & Clarity)
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mt-2">
                  {product.tastingNotes.color}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs font-bold text-[#8b0000] uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  Hương Thơm Phức Hợp (Aroma & Bouquet)
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mt-2">
                  {product.tastingNotes.aroma}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs font-bold text-[#8b0000] uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  Vị Rượu & Cấu Trúc (Taste & Palate)
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mt-2">
                  {product.tastingNotes.taste}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs font-bold text-[#8b0000] uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600" />
                  Hậu Vị & Cảm Xúc Đọng Lại (Finish)
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mt-2">
                  {product.tastingNotes.finish || "Hậu vị lưu luyến dài lâu, bền bỉ với dư vị trái quả chín sẫm cùng nốt hương khoáng chất và vani quý phái."}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-bold text-gray-900 mb-2">
                Thành phần giống nho cấu thành:
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.grapes.map((g, i) => (
                  <span
                    key={i}
                    className="bg-[#fdf2f2] text-[#8b0000] font-bold text-xs px-3 py-1 rounded-full border border-[#f8b4b4]"
                  >
                    🍇 {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "serving" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">
              Nghệ Thuật Phục Vụ & Kết Hợp Ẩm Thực
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#fefce8] p-4 rounded-xl border border-[#fef08a]">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase mb-2">
                  <Thermometer className="w-4 h-4 text-amber-700" />
                  <span>Nhiệt Độ Thưởng Thức</span>
                </div>
                <div className="text-2xl font-black text-amber-800 my-1">
                  {product.servingTemp}
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  Ướp lạnh trong xô đá 15-20 phút trước khi mở nắp để đạt nhiệt độ hoàn hảo nhất.
                </p>
              </div>

              <div className="bg-[#fdf4ff] p-4 rounded-xl border border-[#f5d0fe]">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase mb-2">
                  <Clock className="w-4 h-4 text-purple-700" />
                  <span>Thời Gian Cho Rượu Thở</span>
                </div>
                <div className="text-base font-bold text-purple-800 my-1">
                  {product.decanting}
                </div>
                <p className="text-[11px] text-purple-800/80 leading-relaxed">
                  Giúp rượu tiếp xúc oxy, mở rộng tầng hương hoa quả và làm mềm tannin.
                </p>
              </div>

              <div className="bg-[#f0fdf4] p-4 rounded-xl border border-[#bbf7d0]">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase mb-2">
                  <Wine className="w-4 h-4 text-emerald-700" />
                  <span>Ly Uống Khuyên Dùng</span>
                </div>
                <div className="text-base font-bold text-emerald-800 my-1">
                  {product.glassType}
                </div>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                  Bầu ly tiêu chuẩn giúp hội tụ phân tử hương về phía khứu giác thực khách.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-4">
              <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#8b0000]" />
                Món ăn kết hợp hoàn hảo (Food Pairing):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {product.foodPairings.map((food, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-gray-200"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium text-gray-800">{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="text-center sm:text-left">
                <div className="text-4xl font-black text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                  <span>{product.rating}</span>
                  <span className="text-base text-gray-400 font-normal">/ 5.0</span>
                </div>
                <div className="flex justify-center sm:justify-start text-amber-400 my-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Dựa trên {product.reviewCount} đánh giá từ khách hàng đã mua sản phẩm
                </p>
              </div>

              <button
                onClick={() => alert("Cảm ơn bạn! Tính năng gửi đánh giá sẽ kích hoạt sau khi đơn hàng được giao thành công.")}
                className="bg-[#8b0000] hover:bg-[#720b18] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md"
              >
                Viết Đánh Giá Của Bạn
              </button>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">{rev.name}</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Đã mua hàng
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400 mb-2">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


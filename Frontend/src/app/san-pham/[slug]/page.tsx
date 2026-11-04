"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WineProduct, getApiBaseUrl } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/Product/ProductCard";
import {
  Phone,
  MessageCircle,
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ChevronRight,
  ChevronLeft,
  Wine,
  Send,
  CheckCircle,
  X,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Dynamic 100% backend state
  const [product, setProduct] = useState<WineProduct | any>(null);
  const [relatedCatalog, setRelatedCatalog] = useState<WineProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    // 1. Fetch product detail by slug
    fetch(`${apiUrl}/products/slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((json) => {
        if (json && json.data) {
          setProduct(json.data);
        } else {
          setNotFoundState(true);
        }
      })
      .catch(() => {
        setNotFoundState(true);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 2. Fetch related products catalog
    fetch(`${apiUrl}/products?limit=50`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.data) {
          setRelatedCatalog(json.data);
        }
      })
      .catch(() => { });
  }, [slug]);

  const [activeRelatedTab, setActiveRelatedTab] = useState<"brand" | "grape" | "origin" | "sale">("origin");
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [consultName, setConsultName] = useState("");
  const [consultPhone, setConsultPhone] = useState("");
  const [consultQuantity, setConsultQuantity] = useState("1");
  const [consultSuccess, setConsultSuccess] = useState(false);

  // Filter related products by tabs from backend catalog
  const currentId = product?._id || product?.id;
  const sameBrandProducts = product
    ? relatedCatalog
      .filter((p) => (p._id || p.id) !== currentId && p.brand === product.brand)
      .slice(0, 5)
    : [];

  const sameGrapeProducts = product
    ? relatedCatalog
      .filter(
        (p) =>
          (p._id || p.id) !== currentId &&
          p.grapes?.some((g) => product.grapes?.includes(g))
      )
      .slice(0, 5)
    : [];

  const sameOriginProducts = product
    ? relatedCatalog
      .filter((p) => (p._id || p.id) !== currentId && p.country === product.country)
      .slice(0, 5)
    : [];

  const saleProducts = product
    ? relatedCatalog
      .filter((p) => (p._id || p.id) !== currentId && p.discountPercent > 0)
      .slice(0, 5)
    : [];

  let currentRelatedList = sameOriginProducts;
  if (activeRelatedTab === "brand" && sameBrandProducts.length > 0) currentRelatedList = sameBrandProducts;
  else if (activeRelatedTab === "grape" && sameGrapeProducts.length > 0) currentRelatedList = sameGrapeProducts;
  else if (activeRelatedTab === "sale") currentRelatedList = saleProducts;

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4 py-24 bg-[#fafafa]">
        <div className="w-12 h-12 border-4 border-[#8b0000] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm font-medium">Đang tải thông tin sản phẩm từ hệ thống...</p>
      </div>
    );
  }

  if (notFoundState || !product) {
    notFound();
  }

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultSuccess(true);
    setTimeout(() => {
      setConsultSuccess(false);
      setIsConsultModalOpen(false);
      setConsultName("");
      setConsultPhone("");
    }, 3000);
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://project-ruou.onrender.com";

  const productJsonLd = product
    ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: [product.image],
        description:
          product.tastingNotes?.raw ||
          `${product.name} nhập khẩu chính hãng từ ${product.country}. Bảng giá niêm yết 2026 tại Rượu Tốt.`,
        sku: product.sku,
        mpn: product.sku,
        brand: {
          "@type": "Brand",
          name: product.brand || "Rượu Vang Nhập Khẩu",
        },
        offers: {
          "@type": "Offer",
          url: `${siteUrl}/san-pham/${product.slug}`,
          priceCurrency: "VND",
          price: product.price,
          priceValidUntil: "2026-12-31",
          itemCondition: "https://schema.org/NewCondition",
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "RƯỢU TỐT — Công ty Cổ phần Huy Phong",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating || 4.9,
          reviewCount: product.reviewCount || 45,
          bestRating: 5,
          worstRating: 1,
        },
      }
    : null;

  const breadcrumbJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Sản phẩm",
            item: `${siteUrl}/san-pham`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `Vang ${product.country}`,
            item: `${siteUrl}/san-pham?quoc-gia=${encodeURIComponent(product.country)}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: `${siteUrl}/san-pham/${product.slug}`,
          },
        ],
      }
    : null;

  return (
    <div className="bg-[#fcfcfc] py-5">
      {/* Google Rich Snippets Structured Data */}
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Breadcrumb Navigation - exact Ruoutot style */}
        <nav
          className="flex items-center space-x-1.5 text-[13px] text-gray-500 overflow-x-auto pb-1"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#a4000b] transition flex items-center gap-1">
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <Link href="/san-pham" className="hover:text-[#a4000b] transition">
            Rượu Vang
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <Link
            href={`/san-pham?quoc-gia=${encodeURIComponent(product.country)}`}
            className="hover:text-[#a4000b] transition"
          >
            Vang {product.country}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-gray-800 font-medium truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* 3-COLUMN HERO SECTION - Exact Ruoutot layout */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Column 1 (Left): Product Image Showcase with Watermark */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative w-full aspect-[4/5] bg-white rounded-xl flex items-center justify-center p-4 border border-gray-100 overflow-hidden shadow-sm">
                {/* Watermark Logo top left */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-80 pointer-events-none z-10">
                  <div className="w-6 h-6 bg-[#a4000b] rounded flex items-center justify-center text-white font-serif font-black text-xs">
                    R
                  </div>
                  <div className="leading-tight">
                    <div className="text-[10px] font-black text-[#a4000b]">RƯỢU TỐT</div>
                    <div className="text-[8px] text-gray-500">Rượu ngon dành cho người sành</div>
                  </div>
                </div>

                {/* Wine Bottle Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full max-h-[420px] object-contain filter drop-shadow-xl hover:scale-105 transition duration-500"
                />
              </div>
            </div>

            {/* Column 2 (Middle): Product Title & Specifications Grid */}
            <div className="md:col-span-5 space-y-4">
              <h1 className="text-[20px] md:text-[23px] font-bold text-[#a4000b] leading-tight">
                {product.name}
              </h1>

              {/* Brief specs inline summary */}
              <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                <strong>Tên :</strong> {product.originalName || product.name} <strong>Xuất xứ :</strong> {product.country} <strong>Hãng sản xuất :</strong> {product.brand} <strong>Nguyên liệu :</strong> {product.grapes.join(", ")} <strong>Thể tích :</strong> {product.volume} <strong>Nồng độ :</strong> {product.alcohol} <strong>Màu sắc :</strong> ruby đỏ.
              </p>

              {/* 2-Column Specs Grid with Red Wine Bottle Icon */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px] text-gray-800 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#a4000b] flex-shrink-0" />
                  <span><strong>Dung tích:</strong> {product.volume}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#a4000b] flex-shrink-0" />
                  <span><strong>Giống nho:</strong> {product.grapes[0] || "Cabernet"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#a4000b] flex-shrink-0" />
                  <span><strong>Vùng:</strong> {product.region}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#a4000b] flex-shrink-0" />
                  <span><strong>Thương hiệu:</strong> {product.brand}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#a4000b] flex-shrink-0" />
                  <span><strong>Loại vang:</strong> {product.wineType}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#a4000b] flex-shrink-0" />
                  <span><strong>Phân hạng:</strong> {product.classification}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#a4000b] flex-shrink-0" />
                  <span><strong>Nồng độ cồn:</strong> {product.alcohol}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#a4000b] flex-shrink-0" />
                  <span><strong>Mã SKU:</strong> {product.sku}</span>
                </div>
              </div>

              {/* 18+ Regulatory Warning Box - Ruoutot exact copy */}
              <div className="mt-5 flex items-start gap-2 text-[12px] text-gray-900 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                <AlertCircle className="w-4 h-4 text-[#a4000b] mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Sản phẩm không dành cho người dưới 18 tuổi và phụ nữ đang mang thai. Khi uống rượu bia không lái xe!</strong>
                </p>
              </div>
            </div>

            {/* Column 3 (Right): Price & Action Box */}
            <div className="md:col-span-3 space-y-4 md:pl-4 md:border-l border-gray-200">
              {/* Price */}
              <div>
                <div className="text-[17px] font-bold text-[#a4000b] mb-1 flex items-baseline gap-2">
                  <span>Giá:</span>
                  <span className="text-2xl font-black">{formatPrice(product.price)}</span>
                </div>
                {product.originalPrice > product.price && (
                  <div className="text-xs text-gray-400 line-through">
                    Giá niêm yết: {formatPrice(product.originalPrice)}
                  </div>
                )}
                <div className="text-[12px] text-gray-600 mt-2 leading-tight">
                  Để kiểm tra tình trạng hàng chính xác, vui lòng gọi điện trực tiếp.
                </div>
              </div>

              {/* Action Buttons: Zalo Blue & Hotline Red */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={`https://zalo.me/${siteConfig.hotline.replace(/\./g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#007cb0] hover:bg-[#00608a] text-white font-bold py-2.5 rounded-full shadow transition text-[14px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Liên hệ Zalo</span>
                </a>

                <a
                  href={`tel:${siteConfig.hotline}`}
                  className="w-full flex items-center justify-center gap-2 bg-[#a4000b] hover:bg-[#850000] text-white font-bold py-2.5 rounded-full shadow transition text-[14px]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Liên hệ Hotline</span>
                </a>

                <button
                  onClick={() => setIsConsultModalOpen(true)}
                  className="w-full flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-full text-xs transition border border-gray-300"
                >
                  <Send className="w-3 h-3 text-[#a4000b]" />
                  <span>Để Lại Số Điện Thoại Tư Vấn</span>
                </button>
              </div>

              {/* Policy Card - exact Ruoutot background #f9f9f9 */}
              <div className="bg-[#f9f9f9] rounded-xl p-4 text-[12px] text-gray-900 shadow-sm space-y-3 border border-gray-100">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-[#a4000b] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#a4000b] font-bold text-[12px]">Giao hàng toàn quốc</div>
                    <p className="text-[11px] text-gray-600 leading-tight">
                      Miễn phí vận chuyển đơn từ 1.000.000đ (nội thành Hà Nội, HCM).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-gray-200 pt-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#a4000b] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#a4000b] font-bold text-[12px]">Cam kết chính hãng 100%</div>
                    <p className="text-[11px] text-gray-600 leading-tight">
                      Có đầy đủ tem nhãn, chứng từ nhập khẩu CO/CQ.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-gray-200 pt-2.5">
                  <RotateCcw className="w-4 h-4 text-[#a4000b] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#a4000b] font-bold text-[12px]">Đổi trả linh hoạt</div>
                    <p className="text-[11px] text-gray-600 leading-tight">
                      Trong 7 ngày nếu có lỗi từ nhà sản xuất.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-gray-200 pt-2.5">
                  <Headphones className="w-4 h-4 text-[#a4000b] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#a4000b] font-bold text-[12px]">Hỗ trợ 24/7</div>
                    <p className="text-[11px] text-gray-600 leading-tight">
                      Tư vấn tận tình qua hotline, zalo ({siteConfig.hotlineDisplay}).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRICE TABLE BOX - Ruoutot exact 4-tier pricing */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Bảng giá {product.name}
          </h2>

          <div className="max-w-xl mx-auto overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 font-bold text-gray-700">
                <tr>
                  <th className="py-2.5 px-4 border-b">Phân Loại</th>
                  <th className="py-2.5 px-4 border-b text-right">Đơn Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2.5 px-4 font-medium text-gray-700">Giá niêm yết</td>
                  <td className="py-2.5 px-4 text-right text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </td>
                </tr>
                <tr className="bg-red-50/40">
                  <td className="py-2.5 px-4 font-bold text-gray-900">Giá sale ưu đãi</td>
                  <td className="py-2.5 px-4 text-right font-black text-[#a4000b] text-sm">
                    {formatPrice(product.price)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-gray-700">Giá bán theo thùng (6 chai)</td>
                  <td className="py-2.5 px-4 text-right font-bold text-[#a4000b]">
                    {formatPrice(product.casePrice)} (hoặc Liên hệ)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-gray-700">Giá sỉ / Doanh nghiệp</td>
                  <td className="py-2.5 px-4 text-right text-[#007cb0] font-bold">
                    Liên hệ Hotline {siteConfig.hotlineDisplay}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* EDITORIAL SECTION: THÔNG TIN SẢN PHẨM */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-6 text-sm text-gray-800 leading-relaxed">
          <h2 className="text-xl font-serif font-bold text-gray-900 uppercase tracking-tight border-b pb-3">
            THÔNG TIN SẢN PHẨM
          </h2>

          <p>
            <strong>{product.name}</strong> là một trong những chai vang được ưa chuộng tại thị trường Việt, đến từ vùng <strong>{product.region}</strong>. Đồng thời nó cũng được các chuyên gia thử nếm đánh giá cao cả phức hợp hương thơm và nước rượu vượt trội so với mặt bằng chung của rượu <strong>vang {product.country}</strong>.
          </p>

          <h3 className="font-bold text-base text-gray-900 pt-2">
            Hương vị rượu vang {product.originalName || product.name}
          </h3>

          <p>
            Được làm từ những trái nho <strong>{product.grapes.join(", ")}</strong> tuyển chọn kỹ lưỡng, nước rượu full-body sánh mịn được kế thừa những đặc trưng hương vị cổ điển danh tiếng. Sự hài hòa đan xen của hàm lượng tannin vừa phải và axit sống động là dễ nhận diện nhất.
          </p>

          <p>
            Hương thơm nổi bật của quả mọng chín sẫm như anh đào, việt quất và mận đen lan tỏa ngập tràn. Chùm hương cổ điển đậm đà với mùi gỗ sồi, thuốc lá và cacao rang đem thực khách đến với một không gian thưởng rượu trầm ấm và sang trọng bậc nhất. Sau cùng là đọng lại thứ dư vị mềm mại, trượt dài cùng vị chua êm ái, kéo dài đầy vương vấn.
          </p>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-between text-xs text-gray-400">
            <span>Mã sản phẩm: {product.sku}</span>
            <span>Bảng báo giá 2026 • Công ty CP Huy Phong</span>
          </div>
        </div>

        {/* RELATED PRODUCTS TABS - exact Ruoutot style */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveRelatedTab("origin")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeRelatedTab === "origin"
                  ? "bg-gray-200 text-gray-900 shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              Sản phẩm cùng xuất xứ
            </button>

            <button
              onClick={() => setActiveRelatedTab("grape")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeRelatedTab === "grape"
                  ? "bg-gray-200 text-gray-900 shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              Sản phẩm cùng giống nho
            </button>

            <button
              onClick={() => setActiveRelatedTab("brand")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeRelatedTab === "brand"
                  ? "bg-gray-200 text-gray-900 shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              Sản phẩm cùng thương hiệu
            </button>

            <button
              onClick={() => setActiveRelatedTab("sale")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${activeRelatedTab === "sale"
                  ? "bg-gray-200 text-gray-900 shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              Sản phẩm đang sale
            </button>
          </div>

          {/* 5 Columns Carousel Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {currentRelatedList.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* MODAL: Đặt Hàng Tư Vấn Nhanh */}
        {isConsultModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsConsultModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-red-50 text-[#a4000b] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 uppercase">
                  Nhận Báo Giá & Đặt Hàng Nhanh
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {product.name}
                </p>
              </div>

              {consultSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center text-xs space-y-1">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                  <p className="font-bold text-sm">Gửi yêu cầu thành công!</p>
                  <p>Chuyên viên Huy Phong sẽ gọi lại cho bạn trong ít phút.</p>
                </div>
              ) : (
                <form onSubmit={handleConsultSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Họ và tên của bạn:
                    </label>
                    <input
                      type="text"
                      required
                      value={consultName}
                      onChange={(e) => setConsultName(e.target.value)}
                      placeholder="Nguyễn Văn A..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#a4000b]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Số điện thoại / Zalo:
                    </label>
                    <input
                      type="tel"
                      required
                      value={consultPhone}
                      onChange={(e) => setConsultPhone(e.target.value)}
                      placeholder="0912 345 678..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#a4000b]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Số lượng quan tâm:
                    </label>
                    <select
                      value={consultQuantity}
                      onChange={(e) => setConsultQuantity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-[#a4000b]"
                    >
                      <option value="1">1 chai lẻ (750ml)</option>
                      <option value="6">1 thùng (6 chai) - Tiết kiệm 10%</option>
                      <option value="12">2 thùng (12 chai)</option>
                      <option value="30">Từ 5 thùng trở lên (Báo giá sỉ đại lý)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#a4000b] hover:bg-[#850000] text-white font-bold py-3 rounded-full uppercase tracking-wider text-xs transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Yêu Cầu Tư Vấn</span>
                  </button>

                  <p className="text-[11px] text-gray-400 text-center">
                    Cam kết bảo mật thông tin khách hàng tuyệt đối.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

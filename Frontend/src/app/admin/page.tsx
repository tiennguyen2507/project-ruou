"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Wine,
  Package,
  Layers,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Cloud,
  Check,
  ArrowUpDown,
  DollarSign,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  ProductItem,
  getProducts,
  updateProduct,
  uploadProductImage,
  deleteProduct,
  createProduct,
  seedProducts,
} from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [wineTypeFilter, setWineTypeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [cloudinaryFilter, setCloudinaryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("sku");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetProduct, setUploadTargetProduct] = useState<ProductItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductItem>>({
    name: "",
    originalName: "",
    sku: "",
    slug: "",
    brand: "",
    country: "Pháp",
    category: "Vang Pháp",
    wineType: "Vang Đỏ",
    classification: "AOP",
    grapes: [],
    alcohol: "14%",
    alcoholNumeric: 14,
    volume: "750ml",
    vintage: "2022",
    price: 650000,
    originalPrice: 850000,
    discountPercent: 23,
    stockCount: 50,
    inStock: true,
    image: "/images/products/meillier-bordeaux-superieur-rouge.webp",
  });
  const [newProductGrapesInput, setNewProductGrapesInput] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load products from API
  const fetchProductList = async () => {
    try {
      setRefreshing(true);
      const res = await getProducts({ limit: 200 });
      if (res && res.data) {
        setProducts(res.data);
      }
    } catch (err: any) {
      console.error("Error loading products:", err);
      showToast(err.message || "Không thể tải danh sách sản phẩm từ máy chủ", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductList();
  }, []);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const inStockCount = products.filter((p) => p.inStock).length;
    const outOfStockCount = total - inStockCount;
    const cloudinaryCount = products.filter(
      (p) => Boolean(p.cloudinaryPublicId) || p.image?.includes("res.cloudinary.com")
    ).length;
    const totalInventoryValue = products.reduce(
      (acc, p) => acc + (p.price || 0) * (p.stockCount || 0),
      0
    );

    return {
      total,
      inStockCount,
      outOfStockCount,
      cloudinaryCount,
      totalInventoryValue,
    };
  }, [products]);

  // Unique lists for dropdowns
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.country && set.add(p.country));
    return Array.from(set).sort();
  }, [products]);

  const availableWineTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.wineType && set.add(p.wineType));
    return Array.from(set).sort();
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchGrapes = p.grapes?.some((g) => g.toLowerCase().includes(q));
          const matchCountry = p.country?.toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchBrand && !matchGrapes && !matchCountry) {
            return false;
          }
        }

        // Country
        if (countryFilter !== "all" && p.country !== countryFilter) {
          return false;
        }

        // Wine Type
        if (wineTypeFilter !== "all" && p.wineType !== wineTypeFilter) {
          return false;
        }

        // Stock
        if (stockFilter === "in-stock" && !p.inStock) return false;
        if (stockFilter === "out-stock" && p.inStock) return false;

        // Cloudinary
        const isCloudinary = Boolean(p.cloudinaryPublicId) || p.image?.includes("res.cloudinary.com");
        if (cloudinaryFilter === "cloudinary" && !isCloudinary) return false;
        if (cloudinaryFilter === "local" && isCloudinary) return false;

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy as keyof ProductItem] ?? "";
        let valB: any = b[sortBy as keyof ProductItem] ?? "";

        if (sortBy === "price" || sortBy === "stockCount" || sortBy === "alcoholNumeric") {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    products,
    searchTerm,
    countryFilter,
    wineTypeFilter,
    stockFilter,
    cloudinaryFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Quick InStock Toggle
  const handleToggleStock = async (product: ProductItem) => {
    try {
      const newStatus = !product.inStock;
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: newStatus } : p))
      );

      await updateProduct(product._id, { inStock: newStatus });
      showToast(`Đã đổi trạng thái "${product.name}" sang ${newStatus ? "Còn hàng" : "Hết hàng"}`);
    } catch (err: any) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: product.inStock } : p))
      );
      showToast(err.message || "Không thể cập nhật trạng thái", "error");
    }
  };

  const closeAllModals = () => {
    setUploadModalOpen(false);
    setEditModalOpen(false);
    setCreateModalOpen(false);
    setDeleteModalOpen(false);
  };

  // Open Quick Upload Modal
  const openUploadModal = (product: ProductItem) => {
    closeAllModals();
    setUploadTargetProduct(product);
    setSelectedFile(null);
    setFilePreview(null);
    setUploadModalOpen(true);
  };

  // Handle file selection in Upload Modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  // Perform Cloudinary Upload
  const handleUploadImageSubmit = async () => {
    if (!uploadTargetProduct || !selectedFile) {
      showToast("Vui lòng chọn một file hình ảnh trước", "error");
      return;
    }

    try {
      setActionLoading(true);
      const res = await uploadProductImage(uploadTargetProduct._id, selectedFile);
      if (res && res.data) {
        // Update product in list
        setProducts((prev) =>
          prev.map((p) => (p._id === uploadTargetProduct._id ? res.data : p))
        );
        showToast(
          `Tải ảnh lên Cloudinary thành công! Đã xóa ảnh cũ và lưu vào folder ruoutot_products.`
        );
        setUploadModalOpen(false);
        setUploadTargetProduct(null);
        setSelectedFile(null);
        setFilePreview(null);
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi tải ảnh lên Cloudinary", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (product: ProductItem) => {
    closeAllModals();
    setEditingProduct({ ...product });
    setEditModalOpen(true);
  };

  // Save Edit Product
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setActionLoading(true);
      const res = await updateProduct(editingProduct._id, editingProduct);
      if (res && res.data) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.data : p))
        );
        showToast(`Đã cập nhật sản phẩm "${res.data.name}" thành công!`);
        setEditModalOpen(false);
        setEditingProduct(null);
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi cập nhật sản phẩm", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (product: ProductItem) => {
    closeAllModals();
    setDeletingProduct(product);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      setActionLoading(true);
      const res = await deleteProduct(deletingProduct._id);
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      const hasCloudinaryMsg = res?.data?.deletedImagePublicId
        ? ` (Đã xóa ảnh "${res.data.deletedImagePublicId}" trên Cloudinary)`
        : "";
      showToast(`Đã xóa sản phẩm thành công!${hasCloudinaryMsg}`);
      setDeleteModalOpen(false);
      setDeletingProduct(null);
    } catch (err: any) {
      showToast(err.message || "Lỗi xóa sản phẩm", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    closeAllModals();
    const randomSku = `HP-NEW-${Math.floor(1000 + Math.random() * 9000)}`;
    setNewProduct({
      name: "",
      originalName: "",
      sku: randomSku,
      slug: `ruou-vang-moi-${Date.now()}`,
      brand: "Huy Phong Selection",
      country: "Pháp",
      countryCode: "fr",
      region: "Bordeaux",
      category: "Vang Đỏ Pháp",
      wineType: "Vang Đỏ",
      classification: "AOP",
      grapes: ["Cabernet Sauvignon", "Merlot"],
      alcohol: "14%",
      alcoholNumeric: 14,
      volume: "750ml",
      vintage: "2022",
      price: 750000,
      originalPrice: 950000,
      discountPercent: 21,
      stockCount: 60,
      inStock: true,
      image: "/images/products/meillier-bordeaux-superieur-rouge.webp",
      tastingNotes: {
        raw: "Hương hoa quả đỏ chín mọng, gỗ sồi vani thanh lịch, tannin mượt mà.",
        color: "Đỏ ruby sâu lắng",
        aroma: "Mâm xôi, anh đào đen, gỗ sồi",
        taste: "Cân bằng, êm dịu, hậu vị kéo dài",
      },
    });
    setNewProductGrapesInput("Cabernet Sauvignon, Merlot");
    setCreateModalOpen(true);
  };

  // Create Product Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) {
      showToast("Vui lòng điền tên sản phẩm và mã SKU", "error");
      return;
    }

    try {
      setActionLoading(true);
      const grapesArray = newProductGrapesInput
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      const generatedSlug =
        newProduct.slug ||
        newProduct.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const payload: Partial<ProductItem> = {
        ...newProduct,
        slug: generatedSlug,
        grapes: grapesArray,
      };

      const res = await createProduct(payload);
      if (res && res.data) {
        setProducts((prev) => [res.data, ...prev]);
        showToast(`Thêm mới sản phẩm "${res.data.name}" thành công!`);
        setCreateModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi tạo mới sản phẩm", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Re-seed Database
  const handleReSeed = async () => {
    if (
      !confirm(
        "Bạn có chắc muốn đồng bộ lại 111 sản phẩm gốc từ Catalogue Huy Phong 2026? Thao tác này sẽ cập nhật lại toàn bộ danh mục sản phẩm chuẩn."
      )
    ) {
      return;
    }

    try {
      setRefreshing(true);
      const res = await seedProducts(true);
      showToast(res.message || "Đồng bộ 111 sản phẩm thành công!");
      await fetchProductList();
    } catch (err: any) {
      showToast(err.message || "Lỗi đồng bộ dữ liệu", "error");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] max-w-md animate-bounce-once">
          <div
            className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border text-sm font-medium ${
              toast.type === "success"
                ? "bg-green-900/95 text-green-100 border-green-700"
                : toast.type === "error"
                ? "bg-red-900/95 text-red-100 border-red-700"
                : "bg-blue-900/95 text-blue-100 border-blue-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
            )}
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-300 hover:text-white ml-2 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Standalone Admin Header Bar */}
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-xl flex items-center justify-center font-serif font-black text-2xl shadow-md shrink-0">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-wide text-white uppercase whitespace-nowrap">
                  RƯỢU TỐT — ADMIN PORTAL
                </h1>
                <span className="bg-red-900/60 text-yellow-300 text-[10px] uppercase font-black px-2 py-0.5 rounded border border-yellow-500/40 whitespace-nowrap">
                  Trang Quản Trị Riêng
                </span>
              </div>
              <p className="text-[11px] text-slate-400 whitespace-nowrap">
                Hệ thống quản lý 111+ dòng vang, bảng giá 2026 &amp; tối ưu lưu trữ Cloudinary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Cloudinary Status Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-200 whitespace-nowrap">
              <Cloud className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>Cloudinary:</span>
              <span className="font-semibold text-sky-300">Folder &apos;ruoutot_products&apos;</span>
              <span className="w-2 h-2 rounded-full bg-green-400 ml-1"></span>
            </div>

            <button
              onClick={handleReSeed}
              disabled={refreshing}
              title="Đồng bộ lại danh sách 111 sản phẩm gốc"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-600 transition whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Đồng bộ gốc</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-600 transition whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Xem Web Khách ↗</span>
            </Link>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 bg-[#f9d776] hover:bg-yellow-400 text-red-950 px-3.5 py-1.5 rounded-lg text-xs font-black shadow transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* Metrics Banner */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-[#b30000] flex items-center justify-center shrink-0">
              <Wine className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Tổng Sản Phẩm</div>
              <div className="text-xl font-black text-gray-800">{metrics.total}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Còn Hàng</div>
              <div className="text-xl font-black text-green-700">{metrics.inStockCount}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Hết Hàng</div>
              <div className="text-xl font-black text-amber-600">{metrics.outOfStockCount}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Ảnh Cloudinary</div>
              <div className="text-xl font-black text-sky-600">{metrics.cloudinaryCount} SP</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Giá Trị Kho Ước Tính</div>
              <div className="text-sm font-extrabold text-purple-800">
                {formatPrice(metrics.totalInventoryValue)}
              </div>
            </div>
          </div>
        </section>

        {/* Cloudinary Feature Reminder Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-4 shadow-sm border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-lg text-sky-300 mt-0.5">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-sky-200 flex items-center gap-2">
                Hệ thống lưu trữ ảnh Cloudinary tự động tối ưu
                <span className="text-[10px] bg-green-500/30 text-green-300 px-2 py-0.5 rounded border border-green-400/30">
                  Folder: ruoutot_products
                </span>
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                • <strong>Khi Cập Nhật Ảnh:</strong> Tự động xóa vĩnh viễn ảnh cũ trên Cloudinary để
                tiết kiệm dung lượng và thay thế ảnh mới chuẩn WebP/Auto Quality.
                <br />• <strong>Khi Xóa Sản Phẩm:</strong> Tự động xóa luôn file ảnh trên
                Cloudinary tương ứng.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-xs text-sky-300 font-mono bg-blue-950/80 px-3 py-2 rounded border border-blue-800/80">
            CLOUDINARY_URL: 571933744629575:***@daqwg8oql
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm theo tên rượu, SKU (HP-...), thương hiệu, giống nho, quốc gia..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b30000] focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Country */}
              <select
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo quốc gia"
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b30000]"
              >
                <option value="all">Mọi Quốc Gia ({products.length})</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Wine Type */}
              <select
                value={wineTypeFilter}
                onChange={(e) => {
                  setWineTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo loại vang"
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b30000]"
              >
                <option value="all">Mọi Loại Vang</option>
                {availableWineTypes.map((wt) => (
                  <option key={wt} value={wt}>
                    {wt}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo trạng thái kho"
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b30000]"
              >
                <option value="all">Tất cả tồn kho</option>
                <option value="in-stock">Còn hàng ({metrics.inStockCount})</option>
                <option value="out-stock">Hết hàng ({metrics.outOfStockCount})</option>
              </select>

              {/* Cloudinary Status */}
              <select
                value={cloudinaryFilter}
                onChange={(e) => {
                  setCloudinaryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Lọc theo ảnh Cloudinary"
                className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b30000]"
              >
                <option value="all">Mọi nguồn ảnh</option>
                <option value="cloudinary">Ảnh Cloudinary ({metrics.cloudinaryCount})</option>
                <option value="local">Ảnh cục bộ / mẫu</option>
              </select>

              {(searchTerm ||
                countryFilter !== "all" ||
                wineTypeFilter !== "all" ||
                stockFilter !== "all" ||
                cloudinaryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCountryFilter("all");
                    setWineTypeFilter("all");
                    setStockFilter("all");
                    setCloudinaryFilter("all");
                    setCurrentPage(1);
                  }}
                  className="text-xs text-red-600 hover:underline px-2 font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div>
              Hiển thị{" "}
              <strong className="text-gray-800">{filteredProducts.length}</strong> /{" "}
              {products.length} sản phẩm
            </div>

            <div className="flex items-center gap-2">
              <span>Mỗi trang:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Số sản phẩm mỗi trang"
                className="border border-gray-300 rounded px-1.5 py-1 text-xs bg-white text-gray-700"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>Tất cả</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <RefreshCw className="w-8 h-8 animate-spin text-[#b30000] mb-3" />
              <p className="text-sm font-medium">Đang tải danh sách 111 sản phẩm từ Backend...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-gray-500 space-y-2">
              <Wine className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="font-bold text-gray-700">Không tìm thấy sản phẩm nào phù hợp</h3>
              <p className="text-xs text-gray-400">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc bên trên.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3 w-20 text-center">Hình Ảnh</th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-black transition"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Tên & Thông Tin Rượu</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-black transition hidden md:table-cell"
                      onClick={() => handleSort("country")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Xuất Xứ / Loại</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-black transition hidden lg:table-cell"
                      onClick={() => handleSort("alcoholNumeric")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Độ Cồn / Dung Tích</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-black transition"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center gap-1">
                        <span>Giá Bán / Niêm Yết</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-black transition text-center"
                      onClick={() => handleSort("stockCount")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Tồn Kho</span>
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedProducts.map((product, idx) => {
                    const isCloudinary =
                      Boolean(product.cloudinaryPublicId) ||
                      product.image?.includes("res.cloudinary.com");
                    const indexNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-amber-50/40 transition duration-150 group"
                      >
                        {/* STT */}
                        <td className="py-3 px-3 text-center text-gray-400 font-mono">
                          {indexNumber}
                        </td>

                        {/* Image Thumbnail with Cloudinary Badge */}
                        <td className="py-3 px-3 text-center">
                          <div className="relative w-12 h-16 mx-auto bg-gray-50 border border-gray-200 rounded overflow-hidden flex items-center justify-center p-0.5">
                            <img
                              src={product.image || "/images/products/santa-carolina-carmenere.jpg"}
                              alt={product.name}
                              className="object-contain max-h-full max-w-full group-hover:scale-110 transition duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "/images/products/santa-carolina-carmenere.jpg";
                              }}
                            />
                            {isCloudinary && (
                              <div
                                title={`Đã tối ưu trên Cloudinary: ${product.cloudinaryPublicId || "Uploaded"}`}
                                className="absolute bottom-0 right-0 bg-sky-600 text-white p-0.5 rounded-tl text-[8px]"
                              >
                                <Cloud className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name, SKU & Vintage */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded">
                              {product.sku}
                            </span>
                            {product.vintage && (
                              <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-1.5 py-0.5 rounded">
                                {product.vintage}
                              </span>
                            )}
                            {isCloudinary ? (
                              <span className="text-[9px] bg-sky-100 text-sky-800 font-semibold px-1 py-0.5 rounded flex items-center gap-0.5">
                                <Cloud className="w-2.5 h-2.5" />
                                Cloudinary
                              </span>
                            ) : (
                              <span className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">
                                Local
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-1 group-hover:text-[#b30000] transition">
                            {product.name}
                          </div>
                          {product.originalName && (
                            <div className="text-[11px] text-gray-500 italic line-clamp-1">
                              {product.originalName}
                            </div>
                          )}
                          {product.grapes && product.grapes.length > 0 && (
                            <div className="text-[10px] text-gray-600 mt-0.5">
                              Nho: {product.grapes.join(", ")}
                            </div>
                          )}
                        </td>

                        {/* Country & Category */}
                        <td className="py-3 px-3 hidden md:table-cell">
                          <div className="font-medium text-gray-800">{product.country}</div>
                          <div className="text-[11px] text-gray-500">{product.wineType}</div>
                          {product.region && (
                            <div className="text-[10px] text-gray-400">{product.region}</div>
                          )}
                        </td>

                        {/* Alcohol & Volume */}
                        <td className="py-3 px-3 hidden lg:table-cell">
                          <div className="font-semibold text-gray-800">
                            {product.alcohol || `${product.alcoholNumeric}%`}
                          </div>
                          <div className="text-[11px] text-gray-500">{product.volume}</div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#b30000] text-sm">
                            {formatPrice(product.price)}
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                              <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">
                                -{product.discountPercent}%
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Stock & InStock Toggle */}
                        <td className="py-3 px-3 text-center">
                          <div className="font-bold text-gray-800">{product.stockCount}</div>
                          <button
                            onClick={() => handleToggleStock(product)}
                            className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                              product.inStock
                                ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                                : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                            }`}
                          >
                            {product.inStock ? "Còn Hàng" : "Hết Hàng"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          {/* Quick Cloudinary Upload Button */}
                          <button
                            onClick={() => openUploadModal(product)}
                            title="Tải ảnh mới lên Cloudinary (Tự xóa ảnh cũ)"
                            className="inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 text-sky-700 px-2 py-1.5 rounded-lg border border-sky-200 text-xs font-semibold transition"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Đổi Ảnh</span>
                          </button>

                          {/* Edit Product Button */}
                          <button
                            onClick={() => openEditModal(product)}
                            title="Chỉnh sửa chi tiết thông tin sản phẩm"
                            className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Sửa</span>
                          </button>

                          {/* View on Public Store */}
                          <Link
                            href={`/san-pham/${product.slug}`}
                            target="_blank"
                            title="Xem trang sản phẩm công khai"
                            className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-lg border border-gray-300 text-xs transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Product Button */}
                          <button
                            onClick={() => openDeleteModal(product)}
                            title="Xóa sản phẩm & tự xóa ảnh trên Cloudinary"
                            className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 p-1.5 rounded-lg border border-red-200 text-xs transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredProducts.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between text-xs text-gray-600">
              <div>
                Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> (
                {filteredProducts.length} sản phẩm)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Trước
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded text-xs font-bold transition ${
                          currentPage === pageNum
                            ? "bg-[#b30000] text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 border border-gray-300 rounded bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1"
                >
                  Sau
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: QUICK CLOUDINARY IMAGE UPLOAD MODAL */}
      {/* ========================================================================= */}
      {uploadModalOpen && uploadTargetProduct && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-sky-300">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Tải Ảnh Lên Cloudinary
                  </h3>
                  <p className="text-xs text-sky-200">
                    Thư mục: <code className="bg-blue-950 px-1 py-0.5 rounded">ruoutot_products</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Product Info */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-12 h-16 bg-white border rounded flex items-center justify-center shrink-0 p-1">
                  <img
                    src={uploadTargetProduct.image}
                    alt={uploadTargetProduct.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                    {uploadTargetProduct.sku}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm truncate mt-0.5">
                    {uploadTargetProduct.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    Ảnh hiện tại:{" "}
                    {uploadTargetProduct.cloudinaryPublicId ? (
                      <span className="text-sky-700 font-semibold">
                        Cloudinary ({uploadTargetProduct.cloudinaryPublicId})
                      </span>
                    ) : (
                      "Ảnh cục bộ mặc định"
                    )}
                  </p>
                </div>
              </div>

              {/* Policy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Quy trình xử lý tự động:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-blue-800 pl-1">
                  <li>
                    Ảnh mới sẽ được lưu vào Cloudinary thư mục <strong>ruoutot_products</strong>.
                  </li>
                  <li>
                    Tự động chuyển đổi định dạng <strong>WebP</strong> và nén <strong>Auto Quality</strong>.
                  </li>
                  <li>
                    <strong>Tự động XÓA ảnh cũ</strong> trên Cloudinary để giải phóng dung lượng tài khoản!
                  </li>
                </ul>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Chọn hình ảnh chai rượu mới (JPG, PNG, WEBP):
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition hover:bg-blue-50/30 flex flex-col items-center justify-center space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="space-y-2">
                      <div className="w-24 h-32 mx-auto bg-white border border-gray-200 rounded-lg p-1 flex items-center justify-center shadow-sm">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-xs font-semibold text-blue-700">
                        {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(1)} KB)
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Nhấn để chọn file khác nếu muốn thay đổi
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        Nhấn vào đây để tải ảnh từ máy tính
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Khuyến nghị ảnh tỷ lệ dọc (3:4 hoặc 2:3), phông nền trắng hoặc trong suốt
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleUploadImageSubmit}
                disabled={!selectedFile || actionLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow transition flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải lên Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Tải Lên & Thay Thế Ảnh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL PRODUCT EDIT MODAL */}
      {/* ========================================================================= */}
      {editModalOpen && editingProduct && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-200 overflow-hidden my-8 animate-scale-up">
            {/* Header */}
            <div className="bg-[#b30000] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-950/60 rounded-lg">
                  <Edit2 className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    Chỉnh Sửa Chi Tiết Sản Phẩm
                  </h3>
                  <p className="text-xs text-red-200">
                    SKU: {editingProduct.sku} • ID: {editingProduct._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditProduct}>
              <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto text-xs">
                {/* 1. Basic Information */}
                <div>
                  <h4 className="font-bold text-sm text-gray-800 pb-2 border-b border-gray-200 mb-3 flex items-center gap-2">
                    <Wine className="w-4 h-4 text-[#b30000]" />
                    Thông Tin Cơ Bản
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block font-bold text-gray-700 mb-1">
                        Tên sản phẩm (Tiếng Việt) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, name: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none font-semibold text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Tên gốc / Tên tiếng Anh
                      </label>
                      <input
                        type="text"
                        value={editingProduct.originalName || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, originalName: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Mã SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.sku || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, sku: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-gray-800 focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Thương hiệu (Brand)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.brand || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, brand: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Quốc gia xuất xứ
                      </label>
                      <input
                        type="text"
                        value={editingProduct.country || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, country: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Vùng sản xuất (Region)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.region || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, region: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Loại vang
                      </label>
                      <select
                        value={editingProduct.wineType || "Vang Đỏ"}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, wineType: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      >
                        <option value="Vang Đỏ">Vang Đỏ</option>
                        <option value="Vang Trắng">Vang Trắng</option>
                        <option value="Champagne & Sủi">Champagne & Sủi</option>
                        <option value="Vang Ngọt">Vang Ngọt</option>
                        <option value="Không Cồn">Không Cồn (0.0%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Giống nho (Phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.grapes?.join(", ") || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            grapes: e.target.value
                              .split(",")
                              .map((g) => g.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Cabernet Sauvignon, Merlot..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Niên vụ (Vintage)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.vintage || ""}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, vintage: e.target.value })
                        }
                        placeholder="2021, 2022..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Price, Stock & Specification */}
                <div>
                  <h4 className="font-bold text-sm text-gray-800 pb-2 border-b border-gray-200 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Giá Bán, Tồn Kho & Quy Cách
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Giá bán (VNĐ) *
                      </label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price || 0}
                        onChange={(e) => {
                          const p = Number(e.target.value);
                          const orig = editingProduct.originalPrice || p;
                          const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                          setEditingProduct({
                            ...editingProduct,
                            price: p,
                            discountPercent: disc,
                          });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-[#b30000] focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Giá niêm yết (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={editingProduct.originalPrice || 0}
                        onChange={(e) => {
                          const orig = Number(e.target.value);
                          const p = editingProduct.price || 0;
                          const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                          setEditingProduct({
                            ...editingProduct,
                            originalPrice: orig,
                            discountPercent: disc,
                          });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        % Giảm giá
                      </label>
                      <input
                        type="number"
                        value={editingProduct.discountPercent || 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            discountPercent: Number(e.target.value),
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-red-700 font-bold focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Số lượng tồn kho
                      </label>
                      <input
                        type="number"
                        value={editingProduct.stockCount || 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            stockCount: Number(e.target.value),
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Nồng độ cồn (% numeric)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingProduct.alcoholNumeric || 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            alcoholNumeric: Number(e.target.value),
                            alcohol: `${e.target.value}%`,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Dung tích
                      </label>
                      <input
                        type="text"
                        value={editingProduct.volume || "750ml"}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, volume: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 flex items-center gap-6 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.inStock ?? true}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, inStock: e.target.checked })
                          }
                          className="w-4 h-4 text-[#b30000] rounded focus:ring-[#b30000]"
                        />
                        <span className="font-bold text-gray-800">Hiển thị còn hàng</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.isBestSeller ?? false}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })
                          }
                          className="w-4 h-4 text-[#b30000] rounded focus:ring-[#b30000]"
                        />
                        <span className="font-semibold text-gray-700">Gắn nhãn Bán Chạy (Hot)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. Tasting Notes & Food Pairings */}
                <div>
                  <h4 className="font-bold text-sm text-gray-800 pb-2 border-b border-gray-200 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Ghi Chú Thử Nếm (Tasting Notes)
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Mô tả tóm tắt rượu (Raw Tasting Note từ Catalogue)
                      </label>
                      <textarea
                        rows={2}
                        value={editingProduct.tastingNotes?.raw || ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            tastingNotes: {
                              ...editingProduct.tastingNotes,
                              raw: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Màu sắc</label>
                        <input
                          type="text"
                          value={editingProduct.tastingNotes?.color || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              tastingNotes: {
                                ...editingProduct.tastingNotes,
                                color: e.target.value,
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Hương thơm</label>
                        <input
                          type="text"
                          value={editingProduct.tastingNotes?.aroma || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              tastingNotes: {
                                ...editingProduct.tastingNotes,
                                aroma: e.target.value,
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Vị rượu</label>
                        <input
                          type="text"
                          value={editingProduct.tastingNotes?.taste || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              tastingNotes: {
                                ...editingProduct.tastingNotes,
                                taste: e.target.value,
                              },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Current Image & Cloudinary Info */}
                <div>
                  <h4 className="font-bold text-sm text-gray-800 pb-2 border-b border-gray-200 mb-3 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-600" />
                    Hình Ảnh & Lưu Trữ Cloudinary
                  </h4>

                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="w-16 h-20 bg-white border rounded flex items-center justify-center shrink-0 p-1">
                      <img
                        src={editingProduct.image}
                        alt={editingProduct.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-xs">
                        Đường dẫn ảnh:{" "}
                        <span className="font-normal font-mono text-[11px] text-gray-600 break-all">
                          {editingProduct.image}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Cloudinary Public ID:{" "}
                        <span className="font-mono text-sky-700 font-semibold">
                          {editingProduct.cloudinaryPublicId || "Chưa có (đang dùng ảnh mẫu)"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditModalOpen(false);
                            openUploadModal(editingProduct);
                          }}
                          className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Tải Ảnh Mới Lên Cloudinary Ngay</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-[#b30000] hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu Thay Đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW PRODUCT MODAL */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden my-8 animate-scale-up">
            <div className="bg-[#b30000] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400 text-red-950 rounded-lg">
                  <Plus className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Thêm Sản Phẩm Mới</h3>
                  <p className="text-xs text-red-200">
                    Bổ sung sản phẩm vang mới vào cơ sở dữ liệu và bảng giá
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Rượu Vang Đỏ Chateau Margaux Premier Grand Cru"
                      value={newProduct.name || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#b30000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Mã SKU *</label>
                    <input
                      type="text"
                      required
                      value={newProduct.sku || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Thương hiệu</label>
                    <input
                      type="text"
                      value={newProduct.brand || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Quốc gia</label>
                    <select
                      value={newProduct.country || "Pháp"}
                      onChange={(e) => setNewProduct({ ...newProduct, country: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
                    >
                      <option value="Pháp">Pháp</option>
                      <option value="Ý">Ý (Italy)</option>
                      <option value="Chile">Chile</option>
                      <option value="Tây Ban Nha">Tây Ban Nha</option>
                      <option value="Úc">Úc (Australia)</option>
                      <option value="Mỹ">Mỹ (USA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Loại rượu</label>
                    <select
                      value={newProduct.wineType || "Vang Đỏ"}
                      onChange={(e) => setNewProduct({ ...newProduct, wineType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
                    >
                      <option value="Vang Đỏ">Vang Đỏ</option>
                      <option value="Vang Trắng">Vang Trắng</option>
                      <option value="Champagne & Sủi">Champagne & Sủi</option>
                      <option value="Vang Ngọt">Vang Ngọt</option>
                      <option value="Không Cồn">Không Cồn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price || 0}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold text-[#b30000]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Giá niêm yết (VNĐ)</label>
                    <input
                      type="number"
                      value={newProduct.originalPrice || 0}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nồng độ cồn (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newProduct.alcoholNumeric || 14}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          alcoholNumeric: Number(e.target.value),
                          alcohol: `${e.target.value}%`,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tồn kho ban đầu</label>
                    <input
                      type="number"
                      value={newProduct.stockCount || 50}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stockCount: Number(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">
                      Giống nho (Phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={newProductGrapesInput}
                      onChange={(e) => setNewProductGrapesInput(e.target.value)}
                      placeholder="Cabernet Sauvignon, Merlot..."
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-[#b30000] hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tạo Sản Phẩm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION MODAL WITH CLOUDINARY CLEANUP NOTICE */}
      {/* ========================================================================= */}
      {deleteModalOpen && deletingProduct && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAllModals();
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-black text-lg text-gray-900">
                  Xác Nhận Xóa Sản Phẩm?
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Bạn có chắc chắn muốn xóa sản phẩm{" "}
                  <strong className="text-gray-900">{deletingProduct.name}</strong> (SKU:{" "}
                  <span className="font-mono font-bold text-red-700">{deletingProduct.sku}</span>)?
                </p>
              </div>

              {/* Cloudinary Cleanup Warning */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-left text-xs text-red-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1 text-red-800">
                  <Cloud className="w-4 h-4 text-red-600" />
                  Tự động dọn dẹp Cloudinary:
                </div>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  Hệ thống sẽ <strong>xóa vĩnh viễn hình ảnh liên quan trên Cloudinary</strong>{" "}
                  (Folder <code className="bg-red-200/60 px-1 py-0.5 rounded">ruoutot_products</code>)
                  nhằm giải phóng dung lượng và tối ưu hóa tài khoản của bạn.
                </p>
                {deletingProduct.cloudinaryPublicId && (
                  <div className="text-[10px] font-mono text-red-900 bg-red-100/80 p-1.5 rounded">
                    Cloudinary ID: {deletingProduct.cloudinaryPublicId}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black shadow transition flex items-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xác Nhận Xóa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Standalone Admin Portal Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200 bg-white text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-gray-700">
            Hệ Thống Quản Trị Rượu Tốt (Huy Phong Wine Admin Portal) — Báo Giá 2026
          </p>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span>Trang quản trị nội bộ độc lập</span>
            <span>•</span>
            <span className="text-sky-600 font-medium">Cloudinary: daqwg8oql / ruoutot_products</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

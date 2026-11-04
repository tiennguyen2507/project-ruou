export interface ProductItem {
  _id: string;
  sku: string;
  name: string;
  originalName?: string;
  slug: string;
  brand: string;
  country: string;
  countryCode?: string;
  region: string;
  category: string;
  wineType: string;
  classification?: string;
  grapes: string[];
  alcohol: string;
  alcoholNumeric?: number;
  volume: string;
  vintage: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  casePrice?: number;
  tastingNotes?: {
    raw?: string;
    color?: string;
    aroma?: string;
    taste?: string;
    finish?: string;
  };
  foodPairings?: string[];
  servingTemp?: string;
  decanting?: string;
  glassType?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string | null;
  inStock: boolean;
  stockCount: number;
  pdfPage?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  image: string;
  cloudinaryPublicId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: ProductItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

import { getApiBaseUrl } from '@/data/products';

const API_BASE = getApiBaseUrl();

export async function getProducts(params?: {
  search?: string;
  category?: string;
  country?: string;
  wineType?: string;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}): Promise<ProductsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.category) query.append('category', params.category);
  if (params?.country) query.append('country', params.country);
  if (params?.wineType) query.append('wineType', params.wineType);
  if (params?.inStock !== undefined) query.append('inStock', String(params.inStock));
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.sort) query.append('sort', params.sort);
  if (params?.order) query.append('order', params.order);

  const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi tải danh sách sản phẩm (${res.status}): ${errorText}`);
  }

  return res.json();
}

export async function getProduct(id: string): Promise<{ success: boolean; data: ProductItem }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Lỗi lấy thông tin sản phẩm: ${res.statusText}`);
  }

  return res.json();
}

export async function createProduct(
  data: Partial<ProductItem>
): Promise<{ success: boolean; message: string; data: ProductItem }> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Lỗi tạo mới sản phẩm');
  }

  return res.json();
}

export async function updateProduct(
  id: string,
  data: Partial<ProductItem>
): Promise<{ success: boolean; message: string; data: ProductItem }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Lỗi cập nhật sản phẩm');
  }

  return res.json();
}

export async function uploadProductImage(
  id: string,
  file: File
): Promise<{ success: boolean; message: string; data: ProductItem }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/products/${id}/upload-image`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Lỗi tải ảnh lên Cloudinary');
  }

  return res.json();
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; message: string; data: { id: string; deletedImagePublicId?: string } }> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || 'Lỗi xóa sản phẩm');
  }

  return res.json();
}

export async function seedProducts(
  force: boolean = false
): Promise<{ success: boolean; message: string; count: number }> {
  const res = await fetch(`${API_BASE}/products/seed?force=${force}`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Lỗi đồng bộ dữ liệu gốc');
  }

  return res.json();
}


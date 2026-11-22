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

export function getApiBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").trim();
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

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


export interface ProxySeedingPayload {
  proxy?: string;
  url?: string;
}

export interface ProxyLocationInfo {
  success: boolean;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  details?: string;
  message?: string;
}

export interface ProxySeedingResponse {
  success: boolean;
  status: number;
  targetUrl: string;
  finalUrl: string;
  redirectUrl: string;
  proxyLocation: ProxyLocationInfo | null;
  device?: {
    name: string;
    category: string;
    ua: string;
  };
  referer?: string;
  meta: {
    effectiveUrl: string;
    redirectType: 'x-redirect-url' | 'meta-refresh' | 'http-location' | 'direct';
    totalRedirects: number;
  };
  timestamp: string;
}

export async function runProxySeeding(
  payload?: ProxySeedingPayload
): Promise<ProxySeedingResponse> {
  const res = await fetch(`${API_BASE}/proxy-seeding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Lỗi kiểm tra proxy (${res.status})`);
  }

  return res.json();
}

// --- BACKEND BACKGROUND AUTO-RUN (CHẠY NGẦM BACKEND) APIS ---

export interface BackendAutoRunTask {
  id: string;
  targetUrl: string;
  proxyUrl?: string;
  enabled: boolean;
  totalRuns: number;
  lastRun?: string;
  lastStatus?: number;
  lastSuccess?: boolean;
  lastIp?: string;
  lastDevice?: string;
  lastFinalUrl?: string;
  createdAt: string;
  nextRunAt?: string | null;
  currentDelaySec?: number | null;
  isExecuting?: boolean;
}

export interface BackendAutoRunStatus {
  isRunning: boolean;
  minDelaySec: number;
  maxDelaySec: number;
  totalRuns: number;
  currentTaskIndex: number;
  currentDelaySec: number | null;
  nextRunAt: string | null;
  activeRunningTaskId: string | null;
  tasksCount: number;
  enabledTasksCount: number;
  nextTask: BackendAutoRunTask | null;
}

export async function getBackendAutoRunStatus(): Promise<BackendAutoRunStatus> {
  const res = await fetch(`${API_BASE}/proxy-seeding/auto-run/status`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Lỗi lấy trạng thái Backend (${res.status})`);
  }
  return res.json();
}

export async function getBackendAutoRunTasks(): Promise<BackendAutoRunTask[]> {
  const res = await fetch(`${API_BASE}/proxy-seeding/auto-run/tasks`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Lỗi lấy danh sách task từ Backend (${res.status})`);
  }
  return res.json();
}

export async function startBackendAutoRun(params?: {
  minDelaySec?: number;
  maxDelaySec?: number;
  targetUrl?: string;
  proxyUrl?: string;
}): Promise<BackendAutoRunStatus> {
  const res = await fetch(`${API_BASE}/proxy-seeding/auto-run/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Không thể khởi động tiến trình chạy ngầm Backend');
  }
  return res.json();
}

export async function stopBackendAutoRun(): Promise<BackendAutoRunStatus> {
  const res = await fetch(`${API_BASE}/proxy-seeding/auto-run/stop`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Không thể dừng tiến trình chạy ngầm Backend');
  }
  return res.json();
}

export async function addBackendAutoRunTask(params: {
  targetUrl: string;
  proxyUrl?: string;
}): Promise<BackendAutoRunTask> {
  const res = await fetch(`${API_BASE}/proxy-seeding/auto-run/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Không thể thêm URL vào Backend');
  }
  return res.json();
}

export async function toggleBackendAutoRunTask(id: string): Promise<BackendAutoRunTask> {
  const res = await fetch(`${API_BASE}/proxy-seeding/auto-run/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    throw new Error('Không thể cập nhật trạng thái URL');
  }
  return res.json();
}

export async function deleteBackendAutoRunTask(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/proxy-seeding/auto-run/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Không thể xóa URL khỏi Backend');
  }
  return res.json();
}

export async function getBackendProxyHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/proxy-seeding/history`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function clearBackendProxyHistory(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/proxy-seeding/history`, {
    method: 'DELETE',
  });
  if (!res.ok) return { success: false };
  return res.json();
}

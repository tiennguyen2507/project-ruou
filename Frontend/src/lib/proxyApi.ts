import { getApiBaseUrl } from "./api";

const API_BASE = getApiBaseUrl();

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
  minDelaySec?: number;
  maxDelaySec?: number;
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
  minDelaySec?: number;
  maxDelaySec?: number;
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

export async function updateBackendAutoRunTask(
  id: string,
  params: {
    targetUrl?: string;
    proxyUrl?: string;
    enabled?: boolean;
    minDelaySec?: number;
    maxDelaySec?: number;
  },
): Promise<BackendAutoRunTask> {
  const res = await fetch(`${API_BASE}/proxy-seeding/auto-run/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Không thể cập nhật URL');
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

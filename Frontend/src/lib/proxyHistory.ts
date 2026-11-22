export interface ProxyHistoryItem {
  id: string;
  targetUrl: string;
  finalUrl: string;
  ip: string;
  location: string;
  status: number;
  device: string;
  redirectType: string;
  timestamp: string;
  createdAt?: string;
  success: boolean;
  affSid?: string;
  referer?: string;
}

export const PROXY_HISTORY_STORAGE_KEY = "proxy_seeding_history";

/**
 * Lấy lịch sử từ bộ nhớ tạm (KHÔNG DÙNG MOCK DATA).
 * Tự động loại bỏ bất kỳ dữ liệu mẫu cũ nào nếu còn sót trong localStorage.
 */
export function getProxyHistory(): ProxyHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(PROXY_HISTORY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Loại bỏ triệt để mock data cũ
        const realItems = parsed.filter(
          (item) => !["359444", "887108", "838057"].includes(item.id)
        );
        return realItems;
      }
    }
  } catch {}
  return [];
}

export function saveProxyHistory(items: ProxyHistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    const realItems = (items || []).filter(
      (item) => !["359444", "887108", "838057"].includes(item.id)
    );
    localStorage.setItem(PROXY_HISTORY_STORAGE_KEY, JSON.stringify(realItems));
    window.dispatchEvent(new Event("proxy_history_updated"));
  } catch {}
}

export function clearProxyHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PROXY_HISTORY_STORAGE_KEY);
    window.dispatchEvent(new Event("proxy_history_updated"));
  } catch {}
}

export interface AutoRunTask {
  id: string;
  targetUrl: string;
  proxyUrl?: string; // empty means use server .env
  enabled: boolean;
  totalRuns: number;
  lastRun?: string;
  lastStatus?: number;
  lastSuccess?: boolean;
  lastIp?: string;
}

export const PROXY_AUTO_TASKS_KEY = "proxy_auto_run_tasks";

export const INITIAL_DEFAULT_AUTO_TASKS: AutoRunTask[] = [
  {
    id: "task-default-1",
    targetUrl: "https://shorten.asia/fyscDRRV",
    proxyUrl: "",
    enabled: true,
    totalRuns: 0,
  },
];

export function getAutoRunTasks(): AutoRunTask[] {
  if (typeof window === "undefined") return INITIAL_DEFAULT_AUTO_TASKS;
  try {
    const saved = localStorage.getItem(PROXY_AUTO_TASKS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_DEFAULT_AUTO_TASKS;
}

export function saveAutoRunTasks(tasks: AutoRunTask[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROXY_AUTO_TASKS_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event("proxy_auto_tasks_updated"));
  } catch {}
}

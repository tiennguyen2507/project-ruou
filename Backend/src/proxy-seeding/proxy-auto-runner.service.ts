import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ProxySeedingResult, ProxySeedingService } from './proxy-seeding.service';

export interface AutoRunTask {
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
}

export interface AutoRunStatus {
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
  nextTask: AutoRunTask | null;
}

export interface HistoryItem {
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
}

@Injectable()
export class ProxyAutoRunnerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProxyAutoRunnerService.name);

  // Thời gian lưu trữ lịch sử: đúng 3 ngày (3 * 24 * 60 * 60 * 1000 ms = 259,200,000 ms)
  private readonly RETENTION_MS = 3 * 24 * 60 * 60 * 1000;
  private cleanupIntervalRef: NodeJS.Timeout | null = null;

  private isRunning = false;
  private minDelaySec = 60;
  private maxDelaySec = 180;
  private totalRuns = 0;
  private currentTaskIndex = 0;
  private currentDelaySec: number | null = null;
  private nextRunAt: string | null = null;
  private activeRunningTaskId: string | null = null;
  private timerRef: NodeJS.Timeout | null = null;

  private tasks: AutoRunTask[] = [
    {
      id: 'task-default-1',
      targetUrl: 'https://shorten.asia/fyscDRRV',
      proxyUrl: '',
      enabled: true,
      totalRuns: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  private history: HistoryItem[] = [];

  private stateFilePath = path.join(process.cwd(), 'src/data/proxy-auto-state.json');

  constructor(private readonly seedingService: ProxySeedingService) {}

  onModuleInit() {
    this.loadState();
    this.cleanupOldHistory();
    this.logger.log(
      `[ProxyAutoRunner] Khởi tạo nền tảng chạy ngầm BE. Số tasks: ${this.tasks.length}, Lịch sử: ${this.history.length} bản ghi, Trạng thái: ${
        this.isRunning ? 'Đang chạy' : 'Tạm dừng'
      }`,
    );

    // Tự động kiểm tra và xóa lịch sử cũ hơn 3 ngày định kỳ mỗi 30 phút
    this.cleanupIntervalRef = setInterval(() => {
      this.cleanupOldHistory();
    }, 30 * 60 * 1000);

    // Nếu trước đó đang chạy, tự động khôi phục chạy ngầm
    if (this.isRunning) {
      this.logger.log('[ProxyAutoRunner] Tự động khôi phục tiến trình chạy ngầm...');
      this.scheduleNext(5); // Chạy lại sau 5s khởi động
    }
  }

  onModuleDestroy() {
    this.stop();
    if (this.cleanupIntervalRef) {
      clearInterval(this.cleanupIntervalRef);
      this.cleanupIntervalRef = null;
    }
  }

  /**
   * Tự động dọn dẹp lịch sử: xóa các bản ghi cũ hơn 3 ngày và loại bỏ mock data cũ
   */
  cleanupOldHistory(): boolean {
    const cutoff = Date.now() - this.RETENTION_MS;
    const initialCount = this.history.length;

    this.history = this.history.filter((item) => {
      // Loại bỏ bất kỳ mock ID cũ nào
      if (['359444', '887108', '838057'].includes(item.id)) {
        return false;
      }

      try {
        const timeVal = item.createdAt || item.timestamp;
        const itemTime = new Date(timeVal).getTime();
        return !isNaN(itemTime) && itemTime >= cutoff;
      } catch {
        return false;
      }
    });

    const removed = initialCount - this.history.length;
    if (removed > 0) {
      this.logger.log(
        `[ProxyAutoRunner] 🧹 Đã tự động dọn dẹp ${removed} bản ghi lịch sử cũ hơn 3 ngày. Còn lại: ${this.history.length}`,
      );
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Ghi nhận 1 bản ghi vào lịch sử Backend (tự động xóa sau 3 ngày)
   */
  recordHistory(
    item: Omit<HistoryItem, 'id' | 'timestamp' | 'createdAt'> &
      Partial<Pick<HistoryItem, 'id' | 'timestamp' | 'createdAt'>>,
  ): HistoryItem {
    const now = new Date();
    const historyItem: HistoryItem = {
      id: item.id || Math.floor(100000 + Math.random() * 900000).toString(),
      targetUrl: item.targetUrl,
      finalUrl: item.finalUrl,
      ip: item.ip,
      location: item.location,
      status: item.status,
      device: item.device,
      redirectType: item.redirectType,
      timestamp: item.timestamp || now.toISOString(),
      createdAt: item.createdAt || now.toISOString(),
      success: item.success,
      affSid: item.affSid,
    };

    this.history.unshift(historyItem);
    this.cleanupOldHistory();
    this.saveState();
    return historyItem;
  }

  /**
   * Lưu trạng thái xuống file để duy trì qua các lần restart server
   */
  private saveState() {
    try {
      const dir = path.dirname(this.stateFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = {
        isRunning: this.isRunning,
        minDelaySec: this.minDelaySec,
        maxDelaySec: this.maxDelaySec,
        totalRuns: this.totalRuns,
        currentTaskIndex: this.currentTaskIndex,
        tasks: this.tasks,
        history: this.history.slice(0, 500),
      };

      fs.writeFileSync(this.stateFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.error(`Lỗi khi lưu state file: ${err.message}`);
    }
  }

  /**
   * Tải trạng thái từ file
   */
  private loadState() {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf8');
        const data = JSON.parse(raw);

        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          this.tasks = data.tasks;
        } else {
          this.tasks = [
            {
              id: 'task-default-1',
              targetUrl: 'https://shorten.asia/fyscDRRV',
              proxyUrl: '',
              enabled: true,
              totalRuns: 0,
              createdAt: new Date().toISOString(),
            },
          ];
        }
        if (typeof data.minDelaySec === 'number') this.minDelaySec = data.minDelaySec;
        if (typeof data.maxDelaySec === 'number') this.maxDelaySec = data.maxDelaySec;
        if (typeof data.totalRuns === 'number') this.totalRuns = data.totalRuns;
        if (typeof data.currentTaskIndex === 'number') this.currentTaskIndex = data.currentTaskIndex;
        if (typeof data.isRunning === 'boolean') this.isRunning = data.isRunning;
        if (Array.isArray(data.history)) {
          // Lọc sạch dữ liệu mock cũ và bản ghi quá 3 ngày
          this.history = data.history.filter(
            (item: any) => !['359444', '887108', '838057'].includes(item.id),
          );
        }
      }
    } catch (err: any) {
      this.logger.warn(`Không thể đọc state file cũ: ${err.message}`);
    }
  }

  /**
   * Bắt đầu chạy ngầm ở Backend
   */
  async start(
    minDelaySec?: number,
    maxDelaySec?: number,
    immediateTask?: { targetUrl?: string; proxyUrl?: string },
  ): Promise<AutoRunStatus> {
    if (minDelaySec !== undefined && minDelaySec > 0) {
      this.minDelaySec = minDelaySec;
    }
    if (maxDelaySec !== undefined && maxDelaySec >= this.minDelaySec) {
      this.maxDelaySec = maxDelaySec;
    }

    // Nếu người dùng truyền URL hiện tại từ form, tự động thêm vào list nếu chưa có
    if (immediateTask?.targetUrl) {
      const cleanUrl = immediateTask.targetUrl.trim();
      const cleanProxy = (immediateTask.proxyUrl || '').trim();

      const existingIndex = this.tasks.findIndex(
        (t) => t.targetUrl === cleanUrl && (t.proxyUrl || '') === cleanProxy,
      );

      if (existingIndex === -1) {
        const newTask: AutoRunTask = {
          id: 'task-' + Date.now(),
          targetUrl: cleanUrl,
          proxyUrl: cleanProxy,
          enabled: true,
          totalRuns: 0,
          createdAt: new Date().toISOString(),
        };
        this.tasks.unshift(newTask);
      } else {
        this.tasks[existingIndex].enabled = true;
      }
    }

    const enabledCount = this.tasks.filter((t) => t.enabled).length;
    if (enabledCount === 0) {
      throw new BadRequestException('Vui lòng thêm hoặc bật ít nhất 1 URL trong danh sách chạy tự động.');
    }

    this.isRunning = true;
    this.saveState();
    this.logger.log(
      `[ProxyAutoRunner] BẮT ĐẦU CHẠY NGẦM BACKEND: ${enabledCount} URL [${this.minDelaySec}s - ${this.maxDelaySec}s]`,
    );

    // Kích hoạt lượt chạy đầu tiên ngay lập tức (sau 500ms)
    this.scheduleNext(1);

    return this.getStatus();
  }

  /**
   * Dừng chạy ngầm ở Backend
   */
  stop(): AutoRunStatus {
    this.isRunning = false;
    this.nextRunAt = null;
    this.currentDelaySec = null;
    this.activeRunningTaskId = null;

    if (this.timerRef) {
      clearTimeout(this.timerRef);
      this.timerRef = null;
    }

    this.saveState();
    this.logger.log('[ProxyAutoRunner] ĐÃ DỪNG CHẠY NGẦM BACKEND.');
    return this.getStatus();
  }

  /**
   * Đặt lịch lượt chạy tiếp theo
   */
  private scheduleNext(customDelaySec?: number) {
    if (!this.isRunning) return;

    if (this.timerRef) {
      clearTimeout(this.timerRef);
      this.timerRef = null;
    }

    const delay =
      customDelaySec !== undefined
        ? customDelaySec
        : randomInt(this.minDelaySec, Math.max(this.minDelaySec + 1, this.maxDelaySec + 1));

    this.currentDelaySec = delay;
    this.nextRunAt = new Date(Date.now() + delay * 1000).toISOString();

    this.logger.debug(`[ProxyAutoRunner] Lượt chạy tiếp theo sau ${delay} giây (lúc ${this.nextRunAt})`);

    this.timerRef = setTimeout(async () => {
      await this.executeNextTask();
    }, delay * 1000);
  }

  /**
   * Thực thi URL tiếp theo trong danh sách
   */
  private async executeNextTask() {
    if (!this.isRunning) return;

    const enabledTasks = this.tasks.filter((t) => t.enabled);
    if (enabledTasks.length === 0) {
      this.logger.warn('[ProxyAutoRunner] Không còn URL nào đang bật. Tự động tạm dừng.');
      this.stop();
      return;
    }

    const taskIndex = this.currentTaskIndex % enabledTasks.length;
    const task = enabledTasks[taskIndex];
    this.currentTaskIndex = (taskIndex + 1) % enabledTasks.length;

    this.activeRunningTaskId = task.id;
    this.logger.log(`[ProxyAutoRunner] Đang chạy kiểm tra URL: ${task.targetUrl} | Proxy: ${task.proxyUrl || 'Server .env'}`);

    try {
      const res: ProxySeedingResult = await this.seedingService.check({
        url: task.targetUrl,
        proxy: task.proxyUrl || undefined,
      });

      // Trích xuất aff_sid nếu có
      let affSid: string | undefined;
      try {
        const u = new URL(res.finalUrl);
        affSid = u.searchParams.get('aff_sid') || undefined;
      } catch {}

      // Cập nhật thông tin task
      task.totalRuns = (task.totalRuns || 0) + 1;
      task.lastRun = new Date().toISOString();
      task.lastStatus = res.status;
      task.lastSuccess = res.success;
      task.lastIp = res.proxyLocation?.ip;
      task.lastDevice = res.device?.name;
      task.lastFinalUrl = res.finalUrl;

      this.totalRuns++;

      // Ghi lại lịch sử Backend (tự động dọn dẹp sau 3 ngày)
      this.recordHistory({
        targetUrl: res.targetUrl,
        finalUrl: res.finalUrl,
        ip: res.proxyLocation?.ip || 'Không rõ IP',
        location: res.proxyLocation?.details || 'Viet Nam',
        status: res.status,
        device: res.device?.name || 'Desktop Browser',
        redirectType: res.meta?.redirectType || 'x-redirect-url',
        success: res.success,
        affSid,
      });

      this.logger.log(
        `[ProxyAutoRunner] ✅ Hoàn thành lượt #${this.totalRuns}: HTTP ${res.status} | IP: ${res.proxyLocation?.ip || '--'} | Device: ${res.device?.name}`,
      );
    } catch (err: any) {
      this.logger.error(`[ProxyAutoRunner] ❌ Lỗi khi chạy task (${task.targetUrl}): ${err.message}`);
    } finally {
      this.activeRunningTaskId = null;
      if (this.isRunning) {
        this.scheduleNext();
      }
    }
  }

  /**
   * Thêm task mới
   */
  addTask(targetUrl: string, proxyUrl?: string): AutoRunTask {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      throw new BadRequestException('URL không được để trống.');
    }

    const cleanProxy = (proxyUrl || '').trim();

    const existing = this.tasks.find(
      (t) => t.targetUrl === cleanUrl && (t.proxyUrl || '') === cleanProxy,
    );
    if (existing) {
      throw new BadRequestException('URL và Proxy này đã tồn tại trong danh sách.');
    }

    const newTask: AutoRunTask = {
      id: 'task-' + Date.now(),
      targetUrl: cleanUrl,
      proxyUrl: cleanProxy,
      enabled: true,
      totalRuns: 0,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(newTask);
    this.saveState();
    return newTask;
  }

  /**
   * Bật/Tắt task
   */
  toggleTask(id: string): AutoRunTask {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new BadRequestException('Không tìm thấy task với ID đã cho.');
    }
    task.enabled = !task.enabled;
    this.saveState();
    return task;
  }

  /**
   * Xóa task
   */
  deleteTask(id: string): boolean {
    const prevLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    if (this.tasks.length !== prevLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Lấy danh sách tasks
   */
  getTasks(): AutoRunTask[] {
    return this.tasks;
  }

  /**
   * Lấy trạng thái hiện tại
   */
  getStatus(): AutoRunStatus {
    const enabledTasks = this.tasks.filter((t) => t.enabled);
    const nextTask =
      enabledTasks.length > 0
        ? enabledTasks[this.currentTaskIndex % enabledTasks.length]
        : null;

    return {
      isRunning: this.isRunning,
      minDelaySec: this.minDelaySec,
      maxDelaySec: this.maxDelaySec,
      totalRuns: this.totalRuns,
      currentTaskIndex: this.currentTaskIndex,
      currentDelaySec: this.currentDelaySec,
      nextRunAt: this.nextRunAt,
      activeRunningTaskId: this.activeRunningTaskId,
      tasksCount: this.tasks.length,
      enabledTasksCount: enabledTasks.length,
      nextTask,
    };
  }

  /**
   * Lấy lịch sử (đã tự động dọn dẹp các bản ghi cũ hơn 3 ngày)
   */
  getHistory(): HistoryItem[] {
    this.cleanupOldHistory();
    return this.history;
  }

  /**
   * Xóa lịch sử
   */
  clearHistory(): boolean {
    this.history = [];
    this.saveState();
    return true;
  }
}

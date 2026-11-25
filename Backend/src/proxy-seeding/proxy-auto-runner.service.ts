import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomInt } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ProxySeedingResult, ProxySeedingService } from './proxy-seeding.service';
import {
  ProxyAutoTask as ProxyAutoTaskEntity,
  ProxyAutoTaskDocument,
} from './schemas/proxy-auto-task.schema';
import {
  ProxyAutoConfig,
  ProxyAutoConfigDocument,
} from './schemas/proxy-auto-config.schema';
import {
  ProxyHistory as ProxyHistoryEntity,
  ProxyHistoryDocument,
} from './schemas/proxy-history.schema';

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
  // Các trường hẹn giờ độc lập cho từng URL (không chờ nhau)
  nextRunAt?: string | null;
  currentDelaySec?: number | null;
  isExecuting?: boolean;
  minDelaySec?: number;
  maxDelaySec?: number;
}

export interface AutoRunStatus {
  isRunning: boolean;
  minDelaySec: number;
  maxDelaySec: number;
  totalRuns: number;
  tasksCount: number;
  enabledTasksCount: number;
  defaultProxy?: string;
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
  createdAt?: string | Date;
  success: boolean;
  affSid?: string;
}

@Injectable()
export class ProxyAutoRunnerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProxyAutoRunnerService.name);

  private isRunning = false;
  private minDelaySec = 60;
  private maxDelaySec = 180;
  private totalRuns = 0;
  private defaultProxy = 'socks5h://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324';

  // Quản lý bộ đếm thời gian độc lập cho từng task riêng biệt (không chờ nhau)
  private taskTimers: Map<string, NodeJS.Timeout> = new Map();
  private tasks: AutoRunTask[] = [];
  private historyItems: HistoryItem[] = [];
  private readonly cacheFilePath = path.join(process.cwd(), 'data', 'proxy-tasks-cache.json');
  private readonly historyCacheFilePath = path.join(process.cwd(), 'data', 'proxy-history-cache.json');

  private saveToLocalCache() {
    try {
      const dir = path.dirname(this.cacheFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        isRunning: this.isRunning,
        minDelaySec: this.minDelaySec,
        maxDelaySec: this.maxDelaySec,
        defaultProxy: this.defaultProxy,
        tasks: this.tasks,
      };
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e: any) {
      this.logger.debug(`Không thể ghi cache local: ${e.message}`);
    }
  }

  private saveHistoryToLocalCache() {
    try {
      const dir = path.dirname(this.historyCacheFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.historyCacheFilePath,
        JSON.stringify(this.historyItems.slice(0, 200), null, 2),
        'utf-8',
      );
    } catch (e: any) {
      this.logger.debug(`Không thể ghi cache lịch sử: ${e.message}`);
    }
  }

  private loadHistoryFromLocalCache(): boolean {
    try {
      if (fs.existsSync(this.historyCacheFilePath)) {
        const raw = fs.readFileSync(this.historyCacheFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          this.historyItems = data;
          this.logger.log(
            `[ProxyAutoRunner] 💾 Đã khôi phục ${this.historyItems.length} bản ghi lịch sử từ cache local.`,
          );
          return true;
        }
      }
    } catch (e: any) {
      this.logger.debug(`Không thể đọc cache lịch sử: ${e.message}`);
    }
    return false;
  }

  private loadFromLocalCache(): boolean {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          this.tasks = data.tasks;
          if (data.isRunning !== undefined) this.isRunning = data.isRunning;
          if (data.minDelaySec) this.minDelaySec = data.minDelaySec;
          if (data.maxDelaySec) this.maxDelaySec = data.maxDelaySec;
          if (data.defaultProxy) this.defaultProxy = data.defaultProxy;
          this.totalRuns = this.tasks.reduce((sum, t) => sum + (t.totalRuns || 0), 0);
          this.logger.log(
            `[ProxyAutoRunner] 💾 Đã khôi phục ${this.tasks.length} tasks từ cache local (${
              this.isRunning ? 'Đang chạy' : 'Tạm dừng'
            }).`,
          );
          return true;
        }
      }
    } catch (e: any) {
      this.logger.debug(`Không thể đọc cache local: ${e.message}`);
    }
    return false;
  }

  constructor(
    private readonly seedingService: ProxySeedingService,
    @InjectModel(ProxyAutoTaskEntity.name)
    private readonly taskModel: Model<ProxyAutoTaskDocument>,
    @InjectModel(ProxyAutoConfig.name)
    private readonly configModel: Model<ProxyAutoConfigDocument>,
    @InjectModel(ProxyHistoryEntity.name)
    private readonly historyModel: Model<ProxyHistoryDocument>,
  ) {}

  async onModuleInit() {
    this.loadHistoryFromLocalCache();
    await this.initializeMongoData();
  }

  onModuleDestroy() {
    this.stop();
  }

  /**
   * Nạp cấu hình và danh sách task từ MongoDB khi khởi động
   */
  private async initializeMongoData() {
    try {
      // 1. Nạp hoặc khởi tạo cấu hình từ MongoDB
      let configDoc = await this.configModel.findOne({ key: 'default' });
      if (!configDoc) {
        configDoc = await this.configModel.create({
          key: 'default',
          isRunning: false,
          minDelaySec: 60,
          maxDelaySec: 180,
          totalRuns: 0,
          currentTaskIndex: 0,
          defaultProxy: this.defaultProxy,
        });
        this.logger.log('[ProxyAutoRunner] 📦 Đã tạo cấu hình mặc định ban đầu trong MongoDB.');
      }

      this.isRunning = configDoc.isRunning ?? false;
      this.minDelaySec = configDoc.minDelaySec ?? 60;
      this.maxDelaySec = configDoc.maxDelaySec ?? 180;
      if (configDoc.defaultProxy) {
        this.defaultProxy = configDoc.defaultProxy;
      }

      // 2. Nạp danh sách task từ MongoDB
      const dbTasks = await this.taskModel.find().sort({ createdAt: -1 }).lean();
      if (dbTasks.length === 0) {
        const initialTask: AutoRunTask = {
          id: 'task-default-1',
          targetUrl: 'https://shorten.asia/fyscDRRV',
          proxyUrl: this.defaultProxy,
          enabled: true,
          totalRuns: 0,
          createdAt: new Date().toISOString(),
          nextRunAt: null,
          currentDelaySec: null,
          isExecuting: false,
        };
        await this.taskModel.create(initialTask);
        this.tasks = [initialTask];
        this.logger.log('[ProxyAutoRunner] 📦 Đã khởi tạo task mặc định ban đầu trong MongoDB.');
      } else {
        this.tasks = dbTasks.map((t: any) => ({
          id: t.id,
          targetUrl: t.targetUrl,
          proxyUrl: t.proxyUrl || '',
          enabled: t.enabled ?? true,
          totalRuns: t.totalRuns || 0,
          lastRun: t.lastRun,
          lastStatus: t.lastStatus,
          lastSuccess: t.lastSuccess,
          lastIp: t.lastIp,
          lastDevice: t.lastDevice,
          lastFinalUrl: t.lastFinalUrl,
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
          nextRunAt: null,
          currentDelaySec: null,
          isExecuting: false,
          minDelaySec: t.minDelaySec ?? 60,
          maxDelaySec: t.maxDelaySec ?? 180,
        }));
      }

      // Luôn tính totalRuns theo tổng lượt chạy thực tế của các tasks
      this.totalRuns = this.tasks.reduce((sum, t) => sum + (t.totalRuns || 0), 0);

      const historyCount = await this.historyModel.countDocuments();
      this.logger.log(
        `[ProxyAutoRunner] ✅ Khởi tạo từ MongoDB. Tasks: ${this.tasks.length}, Lịch sử: ${historyCount} bản ghi, Trạng thái: ${
          this.isRunning ? 'Đang chạy' : 'Tạm dừng'
        }`,
      );

      // Nếu trước đó đang chạy, tự động kích hoạt lịch chạy độc lập cho từng URL
      if (this.isRunning) {
        this.logger.log('[ProxyAutoRunner] 🔄 Khôi phục chạy ngầm độc lập cho từng URL...');
        this.startAllEnabledTasks();
      }
      this.saveToLocalCache();
    } catch (err: any) {
      this.logger.warn(
        `[ProxyAutoRunner] ⚠️ Lỗi kết nối MongoDB (${err.message}). Đang kiểm tra cache local...`,
      );
      const loaded = this.loadFromLocalCache();
      if (!loaded && this.tasks.length === 0) {
        this.tasks = [
          {
            id: 'task-default-1',
            targetUrl: 'https://shorten.asia/fyscDRRV',
            proxyUrl: this.defaultProxy,
            enabled: true,
            totalRuns: 0,
            createdAt: new Date().toISOString(),
            nextRunAt: null,
            currentDelaySec: null,
            isExecuting: false,
            minDelaySec: 60,
            maxDelaySec: 180,
          },
        ];
        this.saveToLocalCache();
      }

      if (this.isRunning) {
        this.logger.log('[ProxyAutoRunner] 🔄 Khôi phục chạy ngầm độc lập cho từng URL từ cache...');
        this.startAllEnabledTasks();
      }
    }
  }

  /**
   * Khởi động lịch chạy độc lập cho toàn bộ URL đang bật
   */
  private startAllEnabledTasks() {
    const enabledTasks = this.tasks.filter((t) => t.enabled);
    enabledTasks.forEach((task, index) => {
      // Giãn cách khởi động ban đầu nhẹ (ví dụ 1s, 4s, 7s...) để tránh xung đột socket cùng 1 mili-giây
      const initialDelay = index === 0 ? 1 : Math.min(index * 3 + 1, this.maxDelaySec);
      this.scheduleTask(task.id, initialDelay);
    });
  }

  /**
   * Đặt lịch chạy tiếp theo cho 1 task CỤ THỂ (hoàn toàn độc lập, không liên quan task khác)
   */
  private scheduleTask(taskId: string, customDelaySec?: number) {
    if (!this.isRunning) return;

    const task = this.tasks.find((t) => t.id === taskId);
    if (!task || !task.enabled) return;

    // Xóa timer cũ nếu còn
    const existingTimer = this.taskTimers.get(taskId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.taskTimers.delete(taskId);
    }

    const rawMin = Number(task.minDelaySec) || Number(this.minDelaySec) || 60;
    const rawMax = Number(task.maxDelaySec) || Number(this.maxDelaySec) || 180;
    const min = Math.min(rawMin, rawMax);
    const max = Math.max(rawMin, rawMax);
    const delay =
      customDelaySec !== undefined
        ? customDelaySec
        : randomInt(min, Math.max(min + 1, max + 1));

    task.currentDelaySec = delay;
    task.nextRunAt = new Date(Date.now() + delay * 1000).toISOString();

    this.logger.debug(
      `[ProxyAutoRunner] URL [${task.targetUrl}] sẽ chạy độc lập sau ${delay}s (lúc ${task.nextRunAt})`,
    );

    const timer = setTimeout(async () => {
      await this.executeTask(taskId);
    }, delay * 1000);

    this.taskTimers.set(taskId, timer);
  }

  /**
   * Thực thi 1 task cụ thể và tự động lên lịch chạy tiếp theo cho chính task đó
   */
  private async executeTask(taskId: string) {
    if (!this.isRunning) return;

    const task = this.tasks.find((t) => t.id === taskId);
    if (!task || !task.enabled) {
      this.clearTaskTimer(taskId);
      return;
    }

    task.isExecuting = true;
    const proxyToUse = task.proxyUrl?.trim() || this.defaultProxy;
    this.logger.log(
      `[ProxyAutoRunner] ⚡ Đang chạy URL riêng biệt: ${task.targetUrl} | Proxy: ${proxyToUse || 'Mặc định'}`,
    );

    try {
      const res: ProxySeedingResult = await this.seedingService.check({
        url: task.targetUrl,
        proxy: proxyToUse || undefined,
      });

      let affSid: string | undefined;
      try {
        const u = new URL(res.finalUrl);
        affSid = u.searchParams.get('aff_sid') || undefined;
      } catch {}

      task.totalRuns = (task.totalRuns || 0) + 1;
      task.lastRun = new Date().toISOString();
      task.lastStatus = res.status;
      task.lastSuccess = res.success;
      task.lastIp = res.proxyLocation?.ip;
      task.lastDevice = res.device?.name;
      task.lastFinalUrl = res.finalUrl;

      this.totalRuns = this.tasks.reduce((sum, t) => sum + (t.totalRuns || 0), 0);

      // Lưu MongoDB
      this.taskModel
        .updateOne(
          { id: task.id },
          {
            $set: {
              totalRuns: task.totalRuns,
              lastRun: task.lastRun,
              lastStatus: task.lastStatus,
              lastSuccess: task.lastSuccess,
              lastIp: task.lastIp,
              lastDevice: task.lastDevice,
              lastFinalUrl: task.lastFinalUrl,
            },
          },
        )
        .catch((e) => this.logger.error(`Lỗi cập nhật task Mongo: ${e.message}`));

      this.configModel
        .updateOne({ key: 'default' }, { $set: { totalRuns: this.totalRuns } })
        .catch((e) => this.logger.error(`Lỗi cập nhật runs Mongo: ${e.message}`));

      await this.recordHistory({
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
        `[ProxyAutoRunner] ✅ URL xong [${task.targetUrl}] (Lượt #${task.totalRuns}): HTTP ${res.status} | IP: ${res.proxyLocation?.ip || '--'}`,
      );
    } catch (err: any) {
      this.logger.error(`[ProxyAutoRunner] ❌ Lỗi task (${task.targetUrl}): ${err.message}`);
    } finally {
      task.isExecuting = false;
      // Task này tiếp tục lên lịch cho lượt chạy tiếp theo của chính nó (hoàn toàn tách biệt)
      if (this.isRunning && task.enabled) {
        this.scheduleTask(taskId);
      }
    }
  }

  /**
   * Hủy timer của 1 task
   */
  private clearTaskTimer(taskId: string) {
    const timer = this.taskTimers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.taskTimers.delete(taskId);
    }
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.nextRunAt = null;
      task.currentDelaySec = null;
      task.isExecuting = false;
    }
  }

  /**
   * Bắt đầu chạy ngầm ở Backend (toàn bộ URL chạy độc lập, song song theo timer riêng)
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

    if (immediateTask?.proxyUrl?.trim()) {
      this.defaultProxy = immediateTask.proxyUrl.trim();
    }

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
          proxyUrl: cleanProxy || this.defaultProxy,
          enabled: true,
          totalRuns: 0,
          createdAt: new Date().toISOString(),
          nextRunAt: null,
          currentDelaySec: null,
          isExecuting: false,
        };
        this.tasks.unshift(newTask);
        await this.taskModel.create(newTask).catch((e) =>
          this.logger.error(`Lỗi tạo task: ${e.message}`),
        );
      } else {
        this.tasks[existingIndex].enabled = true;
        await this.taskModel
          .updateOne({ id: this.tasks[existingIndex].id }, { $set: { enabled: true } })
          .catch(() => {});
      }
    }

    const enabledCount = this.tasks.filter((t) => t.enabled).length;
    if (enabledCount === 0) {
      throw new BadRequestException('Vui lòng thêm hoặc bật ít nhất 1 URL trong danh sách chạy tự động.');
    }

    this.isRunning = true;

    this.configModel
      .updateOne(
        { key: 'default' },
        {
          $set: {
            isRunning: true,
            minDelaySec: this.minDelaySec,
            maxDelaySec: this.maxDelaySec,
            defaultProxy: this.defaultProxy,
          },
        },
        { upsert: true },
      )
      .catch((e) => this.logger.warn(`Lỗi cập nhật config Mongo: ${e.message}`));

    this.logger.log(
      `[ProxyAutoRunner] BẮT ĐẦU CHẠY NGẦM ĐỘC LẬP: ${enabledCount} URL [${this.minDelaySec}s - ${this.maxDelaySec}s]`,
    );

    // Kích hoạt tất cả các URL chạy độc lập
    this.startAllEnabledTasks();

    return this.getStatus();
  }

  /**
   * Dừng toàn bộ tiến trình chạy ngầm
   */
  async stop(): Promise<AutoRunStatus> {
    this.isRunning = false;

    // Dừng tất cả các timer độc lập
    for (const [id] of this.taskTimers) {
      this.clearTaskTimer(id);
    }
    this.taskTimers.clear();

    for (const task of this.tasks) {
      task.nextRunAt = null;
      task.currentDelaySec = null;
      task.isExecuting = false;
    }

    this.configModel
      .updateOne({ key: 'default' }, { $set: { isRunning: false } })
      .catch((e) => this.logger.warn(`Lỗi dừng config Mongo: ${e.message}`));

    this.logger.log('[ProxyAutoRunner] ĐÃ DỪNG TOÀN BỘ TIẾN TRÌNH CHẠY NGẦM.');
    return this.getStatus();
  }

  /**
   * Thêm task mới
   */
  async addTask(
    targetUrl: string,
    proxyUrl?: string,
    minDelaySec?: number,
    maxDelaySec?: number,
  ): Promise<AutoRunTask> {
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
      proxyUrl: cleanProxy || this.defaultProxy,
      enabled: true,
      totalRuns: 0,
      createdAt: new Date().toISOString(),
      nextRunAt: null,
      currentDelaySec: null,
      isExecuting: false,
      minDelaySec: minDelaySec && minDelaySec > 0 ? minDelaySec : undefined,
      maxDelaySec: maxDelaySec && maxDelaySec > 0 ? maxDelaySec : undefined,
    };

    this.tasks.unshift(newTask);
    this.taskModel
      .create(newTask)
      .catch((e) => this.logger.warn(`Lỗi lưu task Mongo (lưu tạm memory): ${e.message}`));

    if (cleanProxy) {
      this.defaultProxy = cleanProxy;
      this.configModel
        .updateOne({ key: 'default' }, { $set: { defaultProxy: cleanProxy } })
        .catch(() => {});
    }

    // Nếu hệ thống đang chạy ngầm, kích hoạt ngay lập tức timer độc lập cho task mới này (sau 2s)
    if (this.isRunning) {
      this.scheduleTask(newTask.id, 2);
    }

    this.saveToLocalCache();
    return newTask;
  }

  /**
   * Bật/Tắt 1 task
   */
  async toggleTask(id: string): Promise<AutoRunTask> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new BadRequestException('Không tìm thấy task với ID đã cho.');
    }

    task.enabled = !task.enabled;

    if (!task.enabled) {
      // Tắt task -> hủy timer độc lập của nó
      this.clearTaskTimer(id);
      const anyEnabled = this.tasks.some((t) => t.enabled);
      if (!anyEnabled) {
        this.isRunning = false;
        this.configModel
          .updateOne({ key: 'default' }, { $set: { isRunning: false } })
          .catch(() => {});
      }
    } else {
      // Bật task -> kích hoạt chạy độc lập ngay sau 2s
      this.isRunning = true;
      this.configModel
        .updateOne({ key: 'default' }, { $set: { isRunning: true } })
        .catch(() => {});
      this.scheduleTask(id, 2);
    }

    this.taskModel
      .updateOne({ id }, { $set: { enabled: task.enabled } })
      .catch((e) => this.logger.warn(`Lỗi toggle task Mongo: ${e.message}`));

    this.saveToLocalCache();
    return task;
  }

  /**
   * Chỉnh sửa thông tin 1 task (targetUrl, proxyUrl, enabled)
   */
  async updateTask(
    id: string,
    data: {
      targetUrl?: string;
      proxyUrl?: string;
      enabled?: boolean;
      minDelaySec?: number;
      maxDelaySec?: number;
    },
  ): Promise<AutoRunTask> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new BadRequestException('Không tìm thấy task với ID đã cho.');
    }

    const updates: Partial<AutoRunTask> = {};

    if (data.targetUrl !== undefined) {
      const cleanUrl = data.targetUrl.trim();
      if (!cleanUrl) {
        throw new BadRequestException('URL không được để trống.');
      }
      task.targetUrl = cleanUrl;
      updates.targetUrl = cleanUrl;
    }

    if (data.proxyUrl !== undefined) {
      const cleanProxy = data.proxyUrl.trim();
      task.proxyUrl = cleanProxy;
      updates.proxyUrl = cleanProxy;
    }

    if (data.minDelaySec !== undefined) {
      task.minDelaySec = data.minDelaySec > 0 ? data.minDelaySec : undefined;
      updates.minDelaySec = task.minDelaySec;
    }

    if (data.maxDelaySec !== undefined) {
      task.maxDelaySec = data.maxDelaySec > 0 ? data.maxDelaySec : undefined;
      updates.maxDelaySec = task.maxDelaySec;
    }

    if (data.enabled !== undefined && data.enabled !== task.enabled) {
      task.enabled = data.enabled;
      updates.enabled = data.enabled;

      if (!task.enabled) {
        this.clearTaskTimer(id);
        const anyEnabled = this.tasks.some((t) => t.enabled);
        if (!anyEnabled) {
          this.isRunning = false;
          this.configModel
            .updateOne({ key: 'default' }, { $set: { isRunning: false } })
            .catch(() => {});
        }
      } else {
        this.isRunning = true;
        this.configModel
          .updateOne({ key: 'default' }, { $set: { isRunning: true } })
          .catch(() => {});
        this.scheduleTask(id, 2);
      }
    } else if (
      this.isRunning &&
      task.enabled &&
      (data.minDelaySec !== undefined || data.maxDelaySec !== undefined)
    ) {
      // Khi cập nhật Min/Max giây của task đang chạy, lập tức áp dụng chu kỳ delay mới
      this.scheduleTask(id);
    }

    this.taskModel
      .updateOne({ id }, { $set: updates })
      .catch((e) => this.logger.warn(`Lỗi cập nhật task Mongo: ${e.message}`));

    this.saveToLocalCache();
    return task;
  }

  /**
   * Xóa task
   */
  async deleteTask(id: string): Promise<boolean> {
    this.clearTaskTimer(id);
    const prevLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    if (this.tasks.length !== prevLen) {
      this.taskModel.deleteOne({ id }).catch((e) =>
        this.logger.warn(`Lỗi xóa task Mongo: ${e.message}`),
      );
      this.totalRuns = this.tasks.reduce((sum, t) => sum + (t.totalRuns || 0), 0);
      this.configModel
        .updateOne({ key: 'default' }, { $set: { totalRuns: this.totalRuns } })
        .catch(() => {});
      this.saveToLocalCache();
      return true;
    }
    return false;
  }

  /**
   * Lấy danh sách tasks kèm theo trạng thái đếm ngược riêng của từng task
   */
  getTasks(): AutoRunTask[] {
    return this.tasks;
  }

  /**
   * Lấy trạng thái hiện tại
   */
  getStatus(): AutoRunStatus {
    const enabledTasks = this.tasks.filter((t) => t.enabled);
    const totalRuns = this.tasks.reduce((sum, t) => sum + (t.totalRuns || 0), 0);
    this.totalRuns = totalRuns;

    return {
      isRunning: this.isRunning && enabledTasks.length > 0,
      minDelaySec: this.minDelaySec,
      maxDelaySec: this.maxDelaySec,
      totalRuns: totalRuns,
      tasksCount: this.tasks.length,
      enabledTasksCount: enabledTasks.length,
      defaultProxy: this.defaultProxy,
    };
  }

  /**
   * Ghi nhận 1 bản ghi vào lịch sử Backend
   */
  async recordHistory(
    item: Omit<HistoryItem, 'id' | 'timestamp' | 'createdAt'> &
      Partial<Pick<HistoryItem, 'id' | 'timestamp' | 'createdAt'>>,
  ): Promise<HistoryItem> {
    const now = new Date();
    const historyItem: HistoryItem = {
      id: item.id || Math.floor(100000 + Math.random() * 900000).toString(),
      targetUrl: item.targetUrl,
      finalUrl: item.finalUrl,
      ip: item.ip || 'Không rõ IP',
      location: item.location || 'Viet Nam',
      status: item.status || 200,
      device: item.device || 'Desktop Browser',
      redirectType: item.redirectType || 'x-redirect-url',
      timestamp: item.timestamp || now.toISOString(),
      createdAt: item.createdAt || now,
      success: item.success,
      affSid: item.affSid,
    };

    // Luôn lưu vào bộ nhớ cache local trước để đảm bảo không bao giờ mất lịch sử
    this.historyItems.unshift(historyItem);
    if (this.historyItems.length > 200) {
      this.historyItems = this.historyItems.slice(0, 200);
    }
    this.saveHistoryToLocalCache();

    // Thử lưu vào MongoDB trong nền nếu đang kết nối
    this.historyModel.create(historyItem).catch((err: any) => {
      this.logger.debug(
        `[ProxyAutoRunner] Chưa đồng bộ được vào MongoDB Atlas (${err.message}), đã lưu an toàn vào cache local.`,
      );
    });

    return historyItem;
  }

  /**
   * Lấy lịch sử từ MongoDB hoặc Fallback sang cache local (tối đa 100 bản ghi mới nhất)
   */
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const docs = await this.historyModel
        .find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .exec();

      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          id: d.id,
          targetUrl: d.targetUrl,
          finalUrl: d.finalUrl,
          ip: d.ip,
          location: d.location,
          status: d.status,
          device: d.device,
          redirectType: d.redirectType,
          timestamp: d.timestamp,
          createdAt: d.createdAt,
          success: d.success,
          affSid: d.affSid,
        }));
      }
    } catch (err: any) {
      this.logger.debug(
        `[ProxyAutoRunner] MongoDB Atlas offline hoặc chưa kết nối (${err.message}), trả về lịch sử từ cache local.`,
      );
    }

    // Fallback: trả về lịch sử từ cache local nếu MongoDB offline hoặc rỗng
    return this.historyItems;
  }

  /**
   * Xóa lịch sử trong cả cache local và MongoDB
   */
  async clearHistory(): Promise<boolean> {
    this.historyItems = [];
    this.saveHistoryToLocalCache();
    try {
      await this.historyModel.deleteMany({}).exec();
    } catch (err: any) {
      this.logger.debug(`Lỗi xóa lịch sử MongoDB: ${err.message}`);
    }
    return true;
  }

  /**
   * Cấu hình chung và proxy mặc định
   */
  getConfig() {
    return {
      isRunning: this.isRunning,
      minDelaySec: this.minDelaySec,
      maxDelaySec: this.maxDelaySec,
      totalRuns: this.totalRuns,
      defaultProxy: this.defaultProxy,
    };
  }

  async updateConfig(patch: { defaultProxy?: string; minDelaySec?: number; maxDelaySec?: number }) {
    if (patch.defaultProxy !== undefined) {
      this.defaultProxy = patch.defaultProxy.trim();
    }
    if (patch.minDelaySec !== undefined && patch.minDelaySec > 0) {
      this.minDelaySec = patch.minDelaySec;
    }
    if (patch.maxDelaySec !== undefined && patch.maxDelaySec >= this.minDelaySec) {
      this.maxDelaySec = patch.maxDelaySec;
    }

    await this.configModel
      .updateOne(
        { key: 'default' },
        {
          $set: {
            defaultProxy: this.defaultProxy,
            minDelaySec: this.minDelaySec,
            maxDelaySec: this.maxDelaySec,
          },
        },
        { upsert: true },
      )
      .catch((e) => this.logger.error(`Lỗi updateConfig: ${e.message}`));

    return this.getConfig();
  }

  getDefaultProxy(): string {
    return this.defaultProxy;
  }
}

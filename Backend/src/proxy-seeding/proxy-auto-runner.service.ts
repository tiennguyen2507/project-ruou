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
  private currentTaskIndex = 0;
  private defaultProxy = 'socks5h://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324';
  private currentDelaySec: number | null = null;
  private nextRunAt: string | null = null;
  private activeRunningTaskId: string | null = null;
  private timerRef: NodeJS.Timeout | null = null;

  private tasks: AutoRunTask[] = [];

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
      this.totalRuns = configDoc.totalRuns ?? 0;
      this.currentTaskIndex = configDoc.currentTaskIndex ?? 0;
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
        }));
      }

      const historyCount = await this.historyModel.countDocuments();
      this.logger.log(
        `[ProxyAutoRunner] ✅ Khởi tạo từ MongoDB thành công. Số tasks: ${this.tasks.length}, Lịch sử: ${historyCount} bản ghi, Trạng thái: ${
          this.isRunning ? 'Đang chạy' : 'Tạm dừng'
        }`,
      );

      // Nếu trước đó đang chạy, tự động khôi phục chạy ngầm
      if (this.isRunning) {
        this.logger.log('[ProxyAutoRunner] 🔄 Tự động khôi phục tiến trình chạy ngầm từ MongoDB...');
        this.scheduleNext(5);
      }
    } catch (err: any) {
      this.logger.error(`[ProxyAutoRunner] Lỗi khi nạp dữ liệu từ MongoDB: ${err.message}`);
    }
  }

  /**
   * Ghi nhận 1 bản ghi vào lịch sử Backend lưu trong MongoDB (tự động xóa sau 3 ngày nhờ TTL index)
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

    try {
      await this.historyModel.create(historyItem);
    } catch (err: any) {
      this.logger.error(`[ProxyAutoRunner] Lỗi khi lưu lịch sử vào MongoDB: ${err.message}`);
    }

    return historyItem;
  }

  /**
   * Bắt đầu chạy ngầm ở Backend (lưu trạng thái vào MongoDB)
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

    // Nếu người dùng cung cấp proxyUrl, cập nhật defaultProxy
    if (immediateTask?.proxyUrl?.trim()) {
      this.defaultProxy = immediateTask.proxyUrl.trim();
    }

    // Nếu người dùng truyền URL hiện tại từ form, tự động thêm hoặc kích hoạt lại
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

    // Lưu trạng thái vào MongoDB
    await this.configModel
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
      .catch((e) => this.logger.error(`Lỗi cập nhật config: ${e.message}`));

    this.logger.log(
      `[ProxyAutoRunner] BẮT ĐẦU CHẠY NGẦM BACKEND: ${enabledCount} URL [${this.minDelaySec}s - ${this.maxDelaySec}s]`,
    );

    // Kích hoạt lượt chạy đầu tiên ngay lập tức (sau 1s)
    this.scheduleNext(1);

    return this.getStatus();
  }

  /**
   * Dừng chạy ngầm ở Backend (cập nhật MongoDB)
   */
  async stop(): Promise<AutoRunStatus> {
    this.isRunning = false;
    this.nextRunAt = null;
    this.currentDelaySec = null;
    this.activeRunningTaskId = null;

    if (this.timerRef) {
      clearTimeout(this.timerRef);
      this.timerRef = null;
    }

    await this.configModel
      .updateOne({ key: 'default' }, { $set: { isRunning: false } })
      .catch((e) => this.logger.error(`Lỗi dừng config: ${e.message}`));

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
      await this.stop();
      return;
    }

    const taskIndex = this.currentTaskIndex % enabledTasks.length;
    const task = enabledTasks[taskIndex];
    this.currentTaskIndex = (taskIndex + 1) % enabledTasks.length;

    this.activeRunningTaskId = task.id;
    const proxyToUse = task.proxyUrl?.trim() || this.defaultProxy;
    this.logger.log(
      `[ProxyAutoRunner] Đang chạy kiểm tra URL: ${task.targetUrl} | Proxy: ${proxyToUse || 'Không có'}`,
    );

    try {
      const res: ProxySeedingResult = await this.seedingService.check({
        url: task.targetUrl,
        proxy: proxyToUse || undefined,
      });

      // Trích xuất aff_sid nếu có
      let affSid: string | undefined;
      try {
        const u = new URL(res.finalUrl);
        affSid = u.searchParams.get('aff_sid') || undefined;
      } catch {}

      // Cập nhật thông tin task trong bộ nhớ
      task.totalRuns = (task.totalRuns || 0) + 1;
      task.lastRun = new Date().toISOString();
      task.lastStatus = res.status;
      task.lastSuccess = res.success;
      task.lastIp = res.proxyLocation?.ip;
      task.lastDevice = res.device?.name;
      task.lastFinalUrl = res.finalUrl;

      this.totalRuns++;

      // Cập nhật MongoDB bất đồng bộ
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
        .updateOne(
          { key: 'default' },
          { $set: { totalRuns: this.totalRuns, currentTaskIndex: this.currentTaskIndex } },
        )
        .catch((e) => this.logger.error(`Lỗi cập nhật runs Mongo: ${e.message}`));

      // Ghi lại lịch sử MongoDB (tự động xóa sau 3 ngày nhờ TTL)
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
   * Thêm task mới vào MongoDB và bộ nhớ
   */
  async addTask(targetUrl: string, proxyUrl?: string): Promise<AutoRunTask> {
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
    };

    await this.taskModel.create(newTask);
    this.tasks.unshift(newTask);

    if (cleanProxy) {
      this.defaultProxy = cleanProxy;
      await this.configModel
        .updateOne({ key: 'default' }, { $set: { defaultProxy: cleanProxy } })
        .catch(() => {});
    }

    return newTask;
  }

  /**
   * Bật/Tắt task trong MongoDB và bộ nhớ
   */
  async toggleTask(id: string): Promise<AutoRunTask> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new BadRequestException('Không tìm thấy task với ID đã cho.');
    }
    task.enabled = !task.enabled;
    await this.taskModel
      .updateOne({ id }, { $set: { enabled: task.enabled } })
      .catch((e) => this.logger.error(`Lỗi toggle task: ${e.message}`));
    return task;
  }

  /**
   * Xóa task khỏi MongoDB và bộ nhớ
   */
  async deleteTask(id: string): Promise<boolean> {
    const prevLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    if (this.tasks.length !== prevLen) {
      await this.taskModel.deleteOne({ id }).catch((e) =>
        this.logger.error(`Lỗi xóa task Mongo: ${e.message}`),
      );
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
      defaultProxy: this.defaultProxy,
    };
  }

  /**
   * Lấy lịch sử từ MongoDB (tối đa 100 bản ghi mới nhất)
   */
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const docs = await this.historyModel
        .find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .exec();

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
    } catch (err: any) {
      this.logger.error(`Lỗi lấy lịch sử từ MongoDB: ${err.message}`);
      return [];
    }
  }

  /**
   * Xóa lịch sử trong MongoDB
   */
  async clearHistory(): Promise<boolean> {
    try {
      await this.historyModel.deleteMany({}).exec();
      return true;
    } catch (err: any) {
      this.logger.error(`Lỗi xóa lịch sử MongoDB: ${err.message}`);
      return false;
    }
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
      currentTaskIndex: this.currentTaskIndex,
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

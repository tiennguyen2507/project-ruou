import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Module,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MongooseModule } from '@nestjs/mongoose';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  ProxyAutoRunnerService,
  AutoRunStatus,
  AutoRunTask,
} from './proxy-auto-runner.service';
import {
  ProxySeedingDto,
  ProxySeedingResult,
  ProxySeedingService,
} from './proxy-seeding.service';
import {
  ProxyAutoTask as ProxyAutoTaskEntity,
  ProxyAutoTaskSchema,
} from './schemas/proxy-auto-task.schema';
import {
  ProxyAutoConfig,
  ProxyAutoConfigSchema,
} from './schemas/proxy-auto-config.schema';
import {
  ProxyHistory as ProxyHistoryEntity,
  ProxyHistorySchema,
} from './schemas/proxy-history.schema';

export {
  ProxySeedingDto,
  ProxyLocationInfo,
  DeviceInfo,
  ProxySeedingResult,
  DEVICES,
  ACCEPT_LANGUAGES,
  ProxySeedingService,
} from './proxy-seeding.service';
export {
  AutoRunTask,
  AutoRunStatus,
  ProxyAutoRunnerService,
} from './proxy-auto-runner.service';

export class StartAutoRunDto {
  @ApiPropertyOptional({ description: 'Thời gian delay tối thiểu (giây)', example: 60 })
  @IsOptional()
  @IsNumber()
  minDelaySec?: number;

  @ApiPropertyOptional({ description: 'Thời gian delay tối đa (giây)', example: 180 })
  @IsOptional()
  @IsNumber()
  maxDelaySec?: number;

  @ApiPropertyOptional({
    description: 'URL cần thêm và chạy ngay (nếu có)',
    example: 'https://shorten.asia/fyscDRRV',
  })
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiPropertyOptional({
    description: 'SOCKS5 Proxy (nếu có, để trống = dùng Proxy mặc định)',
    example: 'socks5h://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
  })
  @IsOptional()
  @IsString()
  proxyUrl?: string;
}

export class AddTaskDto {
  @ApiPropertyOptional({
    description: 'URL cần thêm vào danh sách tự động',
    example: 'https://shorten.asia/fyscDRRV',
  })
  @IsString()
  targetUrl: string;

  @ApiPropertyOptional({
    description: 'SOCKS5 Proxy tùy chọn',
    example: 'socks5h://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
  })
  @IsOptional()
  @IsString()
  proxyUrl?: string;
}

export class UpdateConfigDto {
  @ApiPropertyOptional({
    description: 'SOCKS5 Proxy mặc định hệ thống',
    example: 'socks5h://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
  })
  @IsOptional()
  @IsString()
  defaultProxy?: string;

  @ApiPropertyOptional({ description: 'Thời gian delay tối thiểu (giây)', example: 60 })
  @IsOptional()
  @IsNumber()
  minDelaySec?: number;

  @ApiPropertyOptional({ description: 'Thời gian delay tối đa (giây)', example: 180 })
  @IsOptional()
  @IsNumber()
  maxDelaySec?: number;
}

@ApiTags('Proxy Seeding')
@Controller('proxy-seeding')
export class ProxySeedingController {
  constructor(
    private readonly service: ProxySeedingService,
    private readonly autoRunner: ProxyAutoRunnerService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Kiểm tra link sau redirect và vị trí proxy SOCKS5 (POST)',
    description:
      'Thực hiện tra cứu vị trí IP đầu ra của proxy (qua ipwho.is) và gửi request giả lập thiết bị thật để lấy URL cuối cùng sau redirect (hỗ trợ HTTP 3xx, x-redirect-url header, meta refresh).',
  })
  @ApiBody({ type: ProxySeedingDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Kết quả kiểm tra gồm link sau redirect và thông tin vị trí proxy.',
  })
  @ApiResponse({ status: 400, description: 'URL không hợp lệ hoặc trỏ tới mạng nội bộ.' })
  @ApiResponse({ status: 502, description: 'Lỗi kết nối proxy.' })
  @ApiResponse({ status: 503, description: 'Chưa cấu hình proxy trên hệ thống.' })
  async check(@Body() input?: ProxySeedingDto) {
    const res = await this.service.check(input || {});
    try {
      let affSid: string | undefined;
      try {
        const u = new URL(res.finalUrl);
        affSid = u.searchParams.get('aff_sid') || undefined;
      } catch {}

      await this.autoRunner.recordHistory({
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
    } catch {}
    return res;
  }

  @Get()
  @ApiOperation({
    summary: 'Kiểm tra link sau redirect và vị trí proxy SOCKS5 (GET)',
    description: 'Hỗ trợ kiểm tra nhanh qua query parameters ?url=...&proxy=...',
  })
  checkGet(@Query() query: ProxySeedingDto) {
    return this.service.check(query || {});
  }

  // --- BACKGROUND AUTO RUNNER ENDPOINTS (CHẠY NGẦM BACKEND) ---

  @Get('auto-run/status')
  @ApiOperation({
    summary: 'Lấy trạng thái và tiến trình chạy ngầm Backend',
    description:
      'Trả về trạng thái isRunning, thời gian chạy kế tiếp (nextRunAt), countdown và task tiếp theo.',
  })
  getAutoRunStatus() {
    return this.autoRunner.getStatus();
  }

  @Get('auto-run/tasks')
  @ApiOperation({
    summary: 'Lấy danh sách các URL chạy tự động ở Backend (từ MongoDB)',
  })
  getAutoRunTasks() {
    return this.autoRunner.getTasks();
  }

  @Post('auto-run/start')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Bắt đầu tiến trình chạy tự động ngầm ở Backend (lưu MongoDB)',
  })
  startAutoRun(@Body() body: StartAutoRunDto) {
    return this.autoRunner.start(
      body.minDelaySec,
      body.maxDelaySec,
      body.targetUrl ? { targetUrl: body.targetUrl, proxyUrl: body.proxyUrl } : undefined,
    );
  }

  @Post('auto-run/stop')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Dừng tiến trình chạy tự động ngầm ở Backend (cập nhật MongoDB)',
  })
  stopAutoRun() {
    return this.autoRunner.stop();
  }

  @Post('auto-run/tasks')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Thêm URL và Proxy mới vào hàng đợi chạy tự động ngầm (lưu MongoDB)',
  })
  addTask(@Body() body: AddTaskDto) {
    return this.autoRunner.addTask(body.targetUrl, body.proxyUrl);
  }

  @Patch('auto-run/tasks/:id/toggle')
  @ApiOperation({
    summary: 'Bật / Tắt trạng thái chạy của 1 URL trong danh sách (lưu MongoDB)',
  })
  toggleTask(@Param('id') id: string) {
    return this.autoRunner.toggleTask(id);
  }

  @Delete('auto-run/tasks/:id')
  @ApiOperation({
    summary: 'Xóa 1 URL khỏi hàng đợi chạy tự động ngầm (xóa trong MongoDB)',
  })
  async deleteTask(@Param('id') id: string) {
    const success = await this.autoRunner.deleteTask(id);
    return { success };
  }

  @Get('history')
  @ApiOperation({
    summary: 'Lấy lịch sử chạy proxy từ MongoDB (tự động xóa sau 3 ngày)',
  })
  getHistory() {
    return this.autoRunner.getHistory();
  }

  @Delete('history')
  @ApiOperation({
    summary: 'Xóa toàn bộ lịch sử chạy proxy trên MongoDB',
  })
  async clearHistory() {
    const success = await this.autoRunner.clearHistory();
    return { success };
  }

  @Get('config')
  @ApiOperation({
    summary: 'Lấy cấu hình chung và proxy mặc định từ MongoDB',
  })
  getConfig() {
    return this.autoRunner.getConfig();
  }

  @Patch('config')
  @ApiOperation({
    summary: 'Cập nhật cấu hình chung và proxy mặc định trong MongoDB',
  })
  updateConfig(@Body() body: UpdateConfigDto) {
    return this.autoRunner.updateConfig(body);
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProxyAutoTaskEntity.name, schema: ProxyAutoTaskSchema },
      { name: ProxyAutoConfig.name, schema: ProxyAutoConfigSchema },
      { name: ProxyHistoryEntity.name, schema: ProxyHistorySchema },
    ]),
  ],
  controllers: [ProxySeedingController],
  providers: [ProxySeedingService, ProxyAutoRunnerService],
  exports: [ProxySeedingService, ProxyAutoRunnerService],
})
export class ProxySeedingModule {}

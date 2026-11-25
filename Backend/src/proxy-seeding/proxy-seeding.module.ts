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
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MongooseModule } from '@nestjs/mongoose';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
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

// --- SWAGGER RESPONSE & REQUEST DTOS ---

export class ProxyLocationInfoDto {
  @ApiProperty({ description: 'Trạng thái tra cứu vị trí IP', example: true })
  success: boolean;

  @ApiPropertyOptional({ description: 'Địa chỉ IP ngoại mạng của proxy', example: '103.216.74.218' })
  ip?: string;

  @ApiPropertyOptional({ description: 'Thành phố', example: 'Hanoi' })
  city?: string;

  @ApiPropertyOptional({ description: 'Vùng / Tỉnh', example: 'Hanoi' })
  region?: string;

  @ApiPropertyOptional({ description: 'Quốc gia', example: 'Viet Nam' })
  country?: string;

  @ApiPropertyOptional({ description: 'Mã quốc gia', example: 'VN' })
  countryCode?: string;

  @ApiPropertyOptional({ description: 'Mô tả vị trí chi tiết', example: 'Hanoi, Viet Nam' })
  details?: string;
}

export class DeviceInfoDto {
  @ApiProperty({ description: 'Tên thiết bị giả lập', example: 'Facebook In-App (iPhone iOS 18)' })
  name: string;

  @ApiProperty({ description: 'Danh mục thiết bị', example: 'Facebook' })
  category: string;

  @ApiProperty({
    description: 'Chuỗi User-Agent giả lập trình duyệt thật',
    example:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/490.0.0.45.109;]',
  })
  ua: string;
}

export class ProxyRedirectMetaDto {
  @ApiProperty({ description: 'URL hiệu lực cuối cùng', example: 'https://shopee.vn/product/...' })
  effectiveUrl: string;

  @ApiProperty({
    description: 'Kiểu chuyển hướng phát hiện được',
    example: 'x-redirect-url',
    enum: ['x-redirect-url', 'meta-refresh', 'http-location', 'direct'],
  })
  redirectType: string;

  @ApiProperty({ description: 'Tổng số lần chuyển hướng đã qua', example: 3 })
  totalRedirects: number;
}

export class ProxyCheckResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công', example: true })
  success: boolean;

  @ApiProperty({ description: 'HTTP Status code trả về từ đích đến', example: 200 })
  status: number;

  @ApiProperty({ description: 'URL nguồn cần kiểm tra', example: 'https://shorten.asia/fyscDRRV' })
  targetUrl: string;

  @ApiProperty({
    description: 'URL đích đến cuối cùng sau chuỗi redirect',
    example: 'https://ila.edu.vn/tieng-anh-cho-be/?publisher=2215308&aff_sid=xmxJ2vXO...',
  })
  finalUrl: string;

  @ApiProperty({ description: 'URL chuyển hướng', example: 'https://ila.edu.vn/tieng-anh-cho-be/...' })
  redirectUrl: string;

  @ApiPropertyOptional({ description: 'Thông tin vị trí địa lý của Proxy', type: ProxyLocationInfoDto })
  proxyLocation?: ProxyLocationInfoDto;

  @ApiPropertyOptional({ description: 'Thiết bị được bốc thăm ngẫu nhiên', type: DeviceInfoDto })
  device?: DeviceInfoDto;

  @ApiPropertyOptional({
    description: 'Referer được giả lập tương ứng thiết bị',
    example: 'https://l.facebook.com/l.php?u=...',
  })
  referer?: string;

  @ApiProperty({ description: 'Chi tiết thông số kỹ thuật chuyển hướng', type: ProxyRedirectMetaDto })
  meta: ProxyRedirectMetaDto;

  @ApiProperty({ description: 'Thời gian thực hiện kiểm tra', example: '2026-11-22T11:45:00.000Z' })
  timestamp: string;
}

export class AutoRunTaskDto {
  @ApiProperty({ description: 'Mã định danh duy nhất của task', example: 'task-1795320951082' })
  id: string;

  @ApiProperty({ description: 'URL cần seeding tự động', example: 'https://shorten.asia/fyscDRRV' })
  targetUrl: string;

  @ApiPropertyOptional({
    description: 'SOCKS5 Proxy riêng của task (hoặc dùng mặc định)',
    example: 'socks5://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
  })
  proxyUrl?: string;

  @ApiProperty({ description: 'Trạng thái kích hoạt chạy của URL này', example: true })
  enabled: boolean;

  @ApiProperty({ description: 'Tổng số lượt đã thực hiện cho URL này', example: 12 })
  totalRuns: number;

  @ApiPropertyOptional({ description: 'Thời điểm chạy gần nhất', example: '2026-11-22T11:45:00.000Z' })
  lastRun?: string;

  @ApiPropertyOptional({ description: 'HTTP Status lần chạy gần nhất', example: 200 })
  lastStatus?: number;

  @ApiPropertyOptional({ description: 'Kết quả lần chạy gần nhất', example: true })
  lastSuccess?: boolean;

  @ApiPropertyOptional({ description: 'IP ngoại mạng xoay được ở lần chạy gần nhất', example: '103.216.74.218' })
  lastIp?: string;

  @ApiPropertyOptional({ description: 'Thiết bị giả lập lần chạy gần nhất', example: 'Facebook In-App (Android Samsung S24)' })
  lastDevice?: string;

  @ApiPropertyOptional({ description: 'URL cuối cùng đạt được ở lần chạy gần nhất', example: 'https://ila.edu.vn/...' })
  lastFinalUrl?: string;

  @ApiProperty({ description: 'Thời gian tạo task', example: '2026-11-22T11:00:00.000Z' })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Thời điểm lượt chạy tiếp theo (độc lập từng URL, không chờ nhau)',
    example: '2026-11-22T11:47:30.000Z',
  })
  nextRunAt?: string;

  @ApiPropertyOptional({ description: 'Số giây đếm ngược được chọn ngẫu nhiên cho lượt này', example: 95 })
  currentDelaySec?: number;

  @ApiPropertyOptional({ description: 'Task có đang trong quá trình gửi request không', example: false })
  isExecuting?: boolean;

  @ApiPropertyOptional({ description: 'Thời gian delay tối thiểu riêng của URL này (giây)', example: 30 })
  minDelaySec?: number;

  @ApiPropertyOptional({ description: 'Thời gian delay tối đa riêng của URL này (giây)', example: 60 })
  maxDelaySec?: number;
}

export class AutoRunStatusDto {
  @ApiProperty({ description: 'Trạng thái chạy ngầm toàn hệ thống', example: true })
  isRunning: boolean;

  @ApiProperty({ description: 'Khoảng thời gian delay tối thiểu (giây)', example: 60 })
  minDelaySec: number;

  @ApiProperty({ description: 'Khoảng thời gian delay tối đa (giây)', example: 180 })
  maxDelaySec: number;

  @ApiProperty({ description: 'Tổng số lượt chạy đã hoàn thành của toàn hệ thống', example: 45 })
  totalRuns: number;

  @ApiProperty({ description: 'Tổng số lượng URL trong danh sách', example: 3 })
  tasksCount: number;

  @ApiProperty({ description: 'Số lượng URL đang được bật chạy độc lập', example: 3 })
  enabledTasksCount: number;

  @ApiPropertyOptional({
    description: 'Proxy SOCKS5 mặc định của hệ thống',
    example: 'socks5://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
  })
  defaultProxy?: string;
}

export class ProxyHistoryItemDto {
  @ApiProperty({ description: 'Mã định danh bản ghi lịch sử', example: '931254' })
  id: string;

  @ApiProperty({ description: 'URL ban đầu', example: 'https://shorten.asia/fyscDRRV' })
  targetUrl: string;

  @ApiProperty({
    description: 'URL đích đến cuối cùng',
    example: 'https://ila.edu.vn/...&aff_sid=xmxJ2vXOYYrytCSl7FJ4CSIQOGruZEeBZAEstH1795320590',
  })
  finalUrl: string;

  @ApiProperty({ description: 'IP ngoại mạng của proxy', example: '118.71.121.189' })
  ip: string;

  @ApiProperty({ description: 'Vị trí địa lý IP', example: 'Hanoi, Viet Nam' })
  location: string;

  @ApiProperty({ description: 'Mã phản hồi HTTP', example: 200 })
  status: number;

  @ApiProperty({ description: 'Thiết bị giả lập', example: 'Facebook In-App (iPhone iOS 18)' })
  device: string;

  @ApiProperty({ description: 'Kiểu redirect', example: 'x-redirect-url' })
  redirectType: string;

  @ApiProperty({ description: 'Thời gian thực hiện', example: '2026-11-22T11:45:00.000Z' })
  timestamp: string;

  @ApiProperty({ description: 'Kết quả chạy', example: true })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Mã affiliate tracking (aff_sid) trích xuất được',
    example: 'xmxJ2vXOYYrytCSl7FJ4CSIQOGruZEeBZAEstH1795320590',
  })
  affSid?: string;

  @ApiPropertyOptional({
    description: 'Thời gian tạo bản ghi (tự động xóa sau 3 ngày nhờ MongoDB TTL Index)',
    example: '2026-11-22T11:45:00.000Z',
  })
  createdAt?: string;
}

export class ProxyConfigDto {
  @ApiProperty({ description: 'Trạng thái chạy ngầm', example: false })
  isRunning: boolean;

  @ApiProperty({ description: 'Thời gian delay tối thiểu (giây)', example: 60 })
  minDelaySec: number;

  @ApiProperty({ description: 'Thời gian delay tối đa (giây)', example: 180 })
  maxDelaySec: number;

  @ApiProperty({ description: 'Tổng số lượt chạy đã thực hiện', example: 45 })
  totalRuns: number;

  @ApiProperty({
    description: 'Proxy SOCKS5 mặc định của hệ thống',
    example: 'socks5://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
  })
  defaultProxy: string;
}

export class SuccessResponseDto {
  @ApiProperty({ description: 'Trạng thái thao tác thành công', example: true })
  success: boolean;
}

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
    description: 'SOCKS5 Proxy (nếu có, để trống = dùng Proxy mặc định lưu trong MongoDB)',
    example: 'socks5://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
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
    description: 'SOCKS5 Proxy tùy chọn cho URL này (để trống sẽ dùng Proxy mặc định)',
    example: 'socks5://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
  })
  @IsOptional()
  @IsString()
  proxyUrl?: string;

  @ApiPropertyOptional({ description: 'Thời gian delay tối thiểu (giây)', example: 30 })
  @IsOptional()
  @IsNumber()
  minDelaySec?: number;

  @ApiPropertyOptional({ description: 'Thời gian delay tối đa (giây)', example: 60 })
  @IsOptional()
  @IsNumber()
  maxDelaySec?: number;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'URL mới cần kiểm tra',
    example: 'https://shorten.asia/fyscDRRV',
  })
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiPropertyOptional({
    description: 'SOCKS5 Proxy tùy chọn cho URL này (để trống sẽ dùng Proxy mặc định)',
    example: 'socks5://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
  })
  @IsOptional()
  @IsString()
  proxyUrl?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái kích hoạt chạy của URL này',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Thời gian delay tối thiểu (giây)', example: 30 })
  @IsOptional()
  @IsNumber()
  minDelaySec?: number;

  @ApiPropertyOptional({ description: 'Thời gian delay tối đa (giây)', example: 60 })
  @IsOptional()
  @IsNumber()
  maxDelaySec?: number;
}

export class UpdateConfigDto {
  @ApiPropertyOptional({
    description: 'SOCKS5 Proxy mặc định hệ thống lưu trong MongoDB',
    example: 'socks5://valerierunol82:mza2mdazmdq5na==@103.216.74.218:4324',
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
      'Thực hiện tra cứu vị trí IP đầu ra của proxy (qua ipwho.is) và gửi request giả lập thiết bị thật để lấy URL cuối cùng sau redirect (hỗ trợ HTTP 3xx, x-redirect-url header, meta refresh). Kết quả tự động ghi vào lịch sử MongoDB.',
  })
  @ApiBody({ type: ProxySeedingDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Kết quả kiểm tra gồm link sau redirect và thông tin vị trí proxy.',
    type: ProxyCheckResponseDto,
  })
  @ApiResponse({ status: 400, description: 'URL không hợp lệ hoặc trỏ tới mạng nội bộ.' })
  @ApiResponse({ status: 502, description: 'Lỗi kết nối proxy hoặc timeout.' })
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
  @ApiResponse({
    status: 200,
    description: 'Kết quả kiểm tra link và proxy.',
    type: ProxyCheckResponseDto,
  })
  checkGet(@Query() query: ProxySeedingDto) {
    return this.service.check(query || {});
  }

  // --- BACKGROUND AUTO RUNNER ENDPOINTS (CHẠY NGẦM BACKEND ĐỘC LẬP) ---

  @Get('auto-run/status')
  @ApiOperation({
    summary: 'Lấy trạng thái tiến trình chạy ngầm Backend',
    description:
      'Trả về trạng thái isRunning, khoảng thời gian delay ngẫu nhiên, tổng số lượt đã thực hiện và số lượng URL đang kích hoạt.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái chạy ngầm của hệ thống.',
    type: AutoRunStatusDto,
  })
  getAutoRunStatus() {
    return this.autoRunner.getStatus();
  }

  @Get('auto-run/tasks')
  @ApiOperation({
    summary: 'Lấy danh sách các URL chạy tự động độc lập (từ MongoDB)',
    description:
      'Trả về toàn bộ URL đang được lưu trong MongoDB kèm thông tin proxy, số lượt chạy, thời gian chạy tiếp theo (nextRunAt) và bộ hẹn giờ độc lập của từng URL.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách URL chạy tự động.',
    type: [AutoRunTaskDto],
  })
  getAutoRunTasks() {
    return this.autoRunner.getTasks();
  }

  @Post('auto-run/start')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Bắt đầu tiến trình chạy tự động ngầm ở Backend (lưu MongoDB)',
    description:
      'Kích hoạt tiến trình chạy ngầm. Toàn bộ các URL đang bật sẽ được khởi động theo bộ hẹn giờ riêng biệt (song song, độc lập, không chờ đợi nhau).',
  })
  @ApiBody({ type: StartAutoRunDto })
  @ApiResponse({
    status: 200,
    description: 'Khởi động thành công, trả về trạng thái chạy ngầm.',
    type: AutoRunStatusDto,
  })
  @ApiResponse({ status: 400, description: 'Chưa có URL nào được bật trong danh sách.' })
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
    description: 'Hủy toàn bộ các bộ hẹn giờ đang chạy và lưu trạng thái isRunning=false vào MongoDB.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dừng tiến trình thành công.',
    type: AutoRunStatusDto,
  })
  stopAutoRun() {
    return this.autoRunner.stop();
  }

  @Post('auto-run/tasks')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Thêm URL và Proxy mới vào hàng đợi chạy tự động ngầm (lưu MongoDB)',
    description:
      'Thêm URL mới vào MongoDB. Nếu hệ thống đang bật chạy ngầm, URL mới này sẽ tự động nhận timer độc lập và bắt đầu chạy sau 2 giây.',
  })
  @ApiBody({ type: AddTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Thêm task mới thành công.',
    type: AutoRunTaskDto,
  })
  @ApiResponse({ status: 400, description: 'URL không hợp lệ hoặc đã tồn tại trong danh sách.' })
  addTask(@Body() body: AddTaskDto) {
    return this.autoRunner.addTask(body.targetUrl, body.proxyUrl, body.minDelaySec, body.maxDelaySec);
  }

  @Patch('auto-run/tasks/:id/toggle')
  @ApiOperation({
    summary: 'Bật / Tắt trạng thái chạy của 1 URL trong danh sách (lưu MongoDB)',
    description:
      'Bật hoặc tắt 1 URL cụ thể. Khi tắt, timer độc lập của URL đó sẽ bị hủy. Khi bật lại, URL sẽ tự động lên lịch chạy sau 2 giây.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của task cần bật/tắt (vd: task-default-1)',
    example: 'task-default-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái task thành công.',
    type: AutoRunTaskDto,
  })
  @ApiResponse({ status: 400, description: 'Không tìm thấy task với ID đã cho.' })
  toggleTask(@Param('id') id: string) {
    return this.autoRunner.toggleTask(id);
  }

  @Put('auto-run/tasks/:id')
  @ApiOperation({
    summary: 'Chỉnh sửa thông tin URL và Proxy của 1 task (lưu MongoDB)',
    description: 'Cập nhật URL đích, SOCKS5 proxy hoặc trạng thái bật/tắt trong MongoDB.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của task cần chỉnh sửa',
    example: 'task-1795320951082',
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật task thành công.',
    type: AutoRunTaskDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc không tìm thấy task.' })
  updateTask(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    return this.autoRunner.updateTask(id, body);
  }

  @Delete('auto-run/tasks/:id')
  @ApiOperation({
    summary: 'Xóa 1 URL khỏi hàng đợi chạy tự động ngầm (xóa trong MongoDB)',
    description: 'Hủy timer và xóa vĩnh viễn URL khỏi MongoDB.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của task cần xóa',
    example: 'task-1795320951082',
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa task thành công.',
    type: SuccessResponseDto,
  })
  async deleteTask(@Param('id') id: string) {
    const success = await this.autoRunner.deleteTask(id);
    return { success };
  }

  @Get('history')
  @ApiOperation({
    summary: 'Lấy lịch sử chạy proxy từ MongoDB (tối đa 100 bản ghi mới nhất)',
    description:
      'Danh sách các lượt chạy kiểm tra proxy kèm URL đích, IP ngoại mạng, thông tin thiết bị và aff_sid. Bản ghi được cấu hình TTL tự động xóa sau 3 ngày.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách lịch sử chạy proxy.',
    type: [ProxyHistoryItemDto],
  })
  getHistory() {
    return this.autoRunner.getHistory();
  }

  @Delete('history')
  @ApiOperation({
    summary: 'Xóa toàn bộ lịch sử chạy proxy trên MongoDB',
    description: 'Xóa sạch tất cả các bản ghi trong collection proxy_history.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đã xóa toàn bộ lịch sử.',
    type: SuccessResponseDto,
  })
  async clearHistory() {
    const success = await this.autoRunner.clearHistory();
    return { success };
  }

  @Get('config')
  @ApiOperation({
    summary: 'Lấy cấu hình chung và proxy mặc định từ MongoDB',
    description:
      'Trả về thông số cấu hình hệ thống: defaultProxy, isRunning, minDelaySec, maxDelaySec, totalRuns.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cấu hình hiện tại của hệ thống.',
    type: ProxyConfigDto,
  })
  getConfig() {
    return this.autoRunner.getConfig();
  }

  @Patch('config')
  @ApiOperation({
    summary: 'Cập nhật cấu hình chung và proxy mặc định trong MongoDB',
    description:
      'Cập nhật defaultProxy, minDelaySec hoặc maxDelaySec vào collection proxy_auto_config trên MongoDB.',
  })
  @ApiBody({ type: UpdateConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Cấu hình sau khi được cập nhật.',
    type: ProxyConfigDto,
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

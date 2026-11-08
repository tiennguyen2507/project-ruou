import { Body, Controller, Get, Header, HttpCode, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { LoginDto, RegisterDto, SiteDto } from './auth.dto';

@ApiTags('Auth')
@ApiParam({ name: 'site', example: 'ruoutot', description: 'Mã site, chữ thường, số và dấu gạch ngang.' })
@ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
@ApiResponse({ status: 429, description: 'Quá nhiều yêu cầu. Thử lại sau.' })
@ApiResponse({ status: 503, description: 'Chưa cấu hình JWT_SECRET hoặc đang dùng database tạm.' })
@Controller('auth/:site')
@UseGuards(ThrottlerGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Header('Cache-Control', 'no-store')
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản theo site và nhận JWT (15 phút)' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại tại site này.' })
  register(@Param() params: SiteDto, @Body() dto: RegisterDto) { return this.auth.register(params.site, dto); }

  @Header('Cache-Control', 'no-store')
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập bằng email và mật khẩu, nhận JWT (15 phút)' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng.' })
  login(@Param() params: SiteDto, @Body() dto: LoginDto) { return this.auth.login(params.site, dto); }

  @Header('Cache-Control', 'no-store')
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Hồ sơ tài khoản từ JWT của site hiện tại' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ, hết hạn hoặc thuộc site khác.' })
  me(@Param() _params: SiteDto, @Req() req: any) { return req.user; }
}

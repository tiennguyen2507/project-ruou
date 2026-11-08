import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: 'ok',
      service: 'Rượu Tốt Backend API (Huy Phong)',
      message: '🚀 Backend NestJS đang hoạt động bình thường và sẵn sàng!',
      uptime: `${Math.round(process.uptime())} giây`,
      timestamp: new Date().toISOString(),
      database: 'MongoDB Atlas',
      endpoints: {
        root: '/',
        health: '/health hoặc /api/health',
        docs: '/api/docs',
        images: '/api/images',
        auth: '/api/auth/{site}/login',
        products: '/api/products',
        seed: '/api/products/seed',
      },
    };
  }

  @Get('api')
  getApiRoot() {
    return this.getRoot();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      healthy: true,
      service: 'Rượu Tốt Backend API',
      uptime: `${Math.round(process.uptime())} giây`,
      timestamp: new Date().toISOString(),
      memoryUsage: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
    };
  }

  @Get('api/health')
  getApiHealth() {
    return this.getHealth();
  }
}

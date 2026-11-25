import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

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
        dbStatus: '/api/db-status',
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

  @Get('db-status')
  getDbStatus() {
    const stateMap: Record<number, string> = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };
    const readyState = this.connection.readyState;
    const isConnected = readyState === 1;

    return {
      status: isConnected ? 'connected' : 'disconnected',
      readyState,
      stateLabel: stateMap[readyState] || 'Unknown',
      database: this.connection.name || 'ruou_db',
      host: this.connection.host || 'cluster0.jbohbqd.mongodb.net',
      diagnostic: isConnected
        ? 'MongoDB Atlas đang kết nối trực tiếp thành công.'
        : 'MongoDB Atlas đang báo lỗi xác thực tài khoản (bad auth : authentication failed). Vui lòng kiểm tra lại password của user trong mục Database Access trên MongoDB Atlas.',
    };
  }
}

import * as dns from 'dns';
// Fallback to reliable public DNS for MongoDB Atlas SRV resolution on macOS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.CORS_ORIGIN || '*',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 5001;
  await app.listen(port);

  logger.log(`🚀 NestJS Backend server is running at: http://localhost:${port}/api`);
  logger.log(`📦 Product endpoints:`);
  logger.log(`   - GET    /api/products           : Danh sách sản phẩm (tìm kiếm, lọc, phân trang)`);
  logger.log(`   - GET    /api/products/:id       : Chi tiết sản phẩm theo ID / SKU / Slug`);
  logger.log(`   - POST   /api/products           : Thêm sản phẩm mới`);
  logger.log(`   - PATCH  /api/products/:id       : Cập nhật sản phẩm (hỗ trợ ID, SKU hoặc Slug)`);
  logger.log(`   - PUT    /api/products/:id       : Cập nhật toàn bộ sản phẩm`);
  logger.log(`   - DELETE /api/products/:id       : Xóa sản phẩm`);
  logger.log(`   - POST   /api/products/seed      : Nạp 111 sản phẩm từ file PDF vào MongoDB`);
}

bootstrap();


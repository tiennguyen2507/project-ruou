import * as dns from 'dns';
// Fallback to reliable public DNS for MongoDB Atlas SRV resolution on macOS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS cho tất cả các URL (Render, Vercel, localhost, domain riêng,...)
  app.enableCors({
    origin: true, // Cho phép tất cả các origin truy cập (bao gồm https://project-ruou.onrender.com/)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Range',
    exposedHeaders: 'Content-Range, X-Content-Range',
  });

  // Global API Prefix with root & health check exclusions
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health', 'api', 'api/health'],
  });

  // Normalize duplicate slashes (e.g. //products) and route /products -> /api/products
  app.use((req: any, res: any, next: any) => {
    if (typeof req.url === 'string') {
      req.url = req.url.replace(/^\/+/, '/');
      if (req.url.startsWith('/products')) {
        req.url = `/api${req.url}`;
      }
    }
    next();
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const document = SwaggerModule.createDocument(app, new DocumentBuilder()
    .setTitle('Common API')
    .setDescription('API dùng chung cho ảnh Cloudinary và quản lý sản phẩm.')
    .setVersion('1.0')
    .build());
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json' });

  const port = process.env.PORT || 5001;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 NestJS Backend server is running at: http://localhost:${port}/api`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
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


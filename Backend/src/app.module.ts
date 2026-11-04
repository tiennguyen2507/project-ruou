import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AppController } from './app.controller';
import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServerInstance: MongoMemoryServer | null = null;

@Module({
  controllers: [AppController],
  imports: [
    // Global Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Global Cloudinary Module
    CloudinaryModule,

    // Resilient MongoDB Connection via Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('MongooseModule');
        const configuredUri =
          configService.get<string>('DB_mongo') ||
          configService.get<string>('MONGODB_URI');
        const dbName = configService.get<string>('DB_NAME') || 'ruou_db';

        let targetUri = configuredUri;
        let isUsingFallback = false;

        // Verify remote Atlas connection before handing to NestJS MongooseModule
        if (configuredUri) {
          try {
            logger.log(`Kiểm tra kết nối tới MongoDB Atlas...`);
            const testConn = await mongoose.createConnection(configuredUri, {
              dbName,
              serverSelectionTimeoutMS: 4000,
            }).asPromise();
            await testConn.close();
            logger.log(`✅ Kết nối thành công tới MongoDB Atlas (${dbName})!`);
          } catch (err: any) {
            logger.warn(
              `⚠️ Kết nối tới MongoDB Atlas thất bại: ${err.message}. ` +
                `(Nguyên nhân: Mật khẩu chưa chính xác hoặc user chưa được cấp quyền trong Database Access của Atlas).`,
            );
            logger.log(
              `🔄 Đang khởi tạo MongoDB cục bộ dự phòng để NestJS Backend khởi động và phục vụ ngay lập tức...`,
            );
            isUsingFallback = true;
          }
        } else {
          isUsingFallback = true;
        }

        if (isUsingFallback) {
          if (!memoryServerInstance) {
            memoryServerInstance = await MongoMemoryServer.create({
              instance: { dbName },
            });
          }
          targetUri = memoryServerInstance.getUri();
          logger.log(`🚀 Đang chạy trên MongoDB dự phòng tại: ${targetUri}`);
        }

        return {
          uri: targetUri,
          dbName,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log(`Mongoose đã kết nối tới database '${dbName}'!`);
            });
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),

    // Business Modules
    ProductsModule,
  ],
})
export class AppModule {}

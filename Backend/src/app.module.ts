import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProxySeedingModule } from './proxy-seeding/proxy-seeding.module';
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AppController } from './app.controller';

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

    // Direct MongoDB Connection via Mongoose (Strictly from .env, no local fallback)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('MongooseModule');
        const uri =
          configService.get<string>('DB_mongo') ||
          configService.get<string>('MONGODB_URI');
        const dbName = configService.get<string>('DB_NAME') || 'ruou_db';

        const maskedUri = uri ? uri.replace(/:[^:@]+@/, ':***@') : 'UNDEFINED';
        logger.log(`🔗 Đang kết nối trực tiếp tới MongoDB từ .env: ${maskedUri} (Database: ${dbName})`);

        return {
          uri,
          dbName,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log(`✅ Mongoose đã kết nối trực tiếp thành công tới MongoDB Atlas (${dbName})!`);
            });
            connection.on('error', (err) => {
              logger.error(`❌ Lỗi kết nối MongoDB Atlas: ${err.message}`);
            });
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),

    // Business Modules
    ProductsModule,
    AuthModule,
    ProxySeedingModule,
  ],
})
export class AppModule {}

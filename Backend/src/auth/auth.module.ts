import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { AuthUser, AuthUserSchema } from './user.schema';
@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]), ConfigModule, JwtModule.register({}), MongooseModule.forFeature([{ name: AuthUser.name, schema: AuthUserSchema }])],
  controllers: [AuthController], providers: [AuthService, JwtAuthGuard, ThrottlerGuard], exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}

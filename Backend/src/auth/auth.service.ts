import { ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, isValidObjectId } from 'mongoose';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { AuthUser, AuthUserDocument } from './user.schema';
import { LoginDto, RegisterDto } from './auth.dto';

const scrypt = promisify(scryptCallback);
const ISSUER = 'common-api';
const TTL = 900;
@Injectable()
export class AuthService {
  constructor(@InjectModel(AuthUser.name) private readonly users: Model<AuthUser>, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  private secret() {
    if (this.config.get('AUTH_DB_PERSISTENT') === false) throw new ServiceUnavailableException('Auth yêu cầu MongoDB bền vững; database hiện đang dùng bộ nhớ tạm.');
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret || Buffer.byteLength(secret) < 32) throw new ServiceUnavailableException('Cần cấu hình JWT_SECRET tối thiểu 32 byte.');
    return secret;
  }
  private profile(user: AuthUserDocument) {
    return { id: user._id.toString(), site: user.site, email: user.email, name: user.name, phone: user.phone, address: user.address };
  }
  private async tokens(user: AuthUserDocument) {
    const accessToken = await this.jwt.signAsync({ site: user.site }, { secret: this.secret(), algorithm: 'HS256', subject: user._id.toString(), audience: user.site, issuer: ISSUER, expiresIn: TTL });
    return { accessToken, tokenType: 'Bearer', expiresIn: TTL, user: this.profile(user) };
  }
  async register(site: string, dto: RegisterDto) {
    this.secret();
    await this.users.init();
    const salt = randomBytes(16).toString('hex');
    const hash = await scrypt(dto.password, salt, 64) as Buffer;
    try {
      const user = await this.users.create({ site, email: dto.email, name: dto.name, phone: dto.phone, address: dto.address, passwordHash: `${salt}:${hash.toString('hex')}` });
      return await this.tokens(user);
    } catch (error) {
      if (error.code === 11000) throw new ConflictException('Email đã được đăng ký tại site này.');
      throw error;
    }
  }
  async login(site: string, dto: LoginDto) {
    this.secret();
    const user = await this.users.findOne({ site, email: dto.email }).select('+passwordHash').exec();
    // Hash even for unknown accounts to avoid a fast email enumeration path.
    const [salt, stored] = (user?.passwordHash || `${'0'.repeat(32)}:${'0'.repeat(128)}`).split(':');
    const actual = await scrypt(dto.password, salt, 64) as Buffer;
    const expected = Buffer.from(stored, 'hex');
    if (!user || actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    return this.tokens(user);
  }
  async authenticate(site: string, authorization?: string) {
    const secret = this.secret();
    const match = /^Bearer ([^\s]+)$/i.exec(authorization || '');
    if (!match) throw new UnauthorizedException('Thiếu Bearer token.');
    let claims: { sub: string; site: string };
    try {
      claims = await this.jwt.verifyAsync(match[1], { secret, algorithms: ['HS256'], audience: site, issuer: ISSUER });
      if (claims.site !== site || !isValidObjectId(claims.sub)) throw new Error('Invalid claims');
    } catch { throw new UnauthorizedException('Token không hợp lệ hoặc hết hạn.'); }
    const user = await this.users.findOne({ _id: claims.sub, site }).exec();
    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại.');
    return this.profile(user);
  }
}

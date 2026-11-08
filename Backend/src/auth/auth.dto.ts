import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SiteDto {
  @ApiProperty({ example: 'ruoutot', description: 'Mã site, chữ thường, số và dấu gạch ngang.' })
  @Matches(/^[a-z0-9][a-z0-9-]{0,62}$/)
  site: string;
}
export class LoginDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Email (hỗ trợ Gmail và các nhà cung cấp khác).' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'MyPassword123!', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Nguyễn Văn An' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '0901234567' })
  @Matches(/^\+?[0-9]{9,15}$/)
  phone: string;

  @ApiProperty({ example: '123 Nguyễn Huệ, TP. Hồ Chí Minh' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address: string;
}

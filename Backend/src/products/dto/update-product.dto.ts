import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  originalName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wineType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  classification?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  grapes?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  alcohol?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  alcoholNumeric?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  volume?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  vintage?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  casePrice?: number;

  @IsOptional()
  tastingNotes?: {
    raw?: string;
    color?: string;
    aroma?: string;
    taste?: string;
    finish?: string;
  };

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  foodPairings?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  servingTemp?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  decanting?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  glassType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  reviewCount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  stockCount?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  pdfPage?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cloudinaryPublicId?: string;
}

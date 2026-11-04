import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  originalName?: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  wineType?: string;

  @IsString()
  @IsOptional()
  classification?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  grapes?: string[];

  @IsString()
  @IsOptional()
  alcohol?: string;

  @IsNumber()
  @IsOptional()
  alcoholNumeric?: number;

  @IsString()
  @IsOptional()
  volume?: string;

  @IsString()
  @IsOptional()
  vintage?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsNumber()
  @IsOptional()
  discountPercent?: number;

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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  foodPairings?: string[];

  @IsString()
  @IsOptional()
  servingTemp?: string;

  @IsString()
  @IsOptional()
  decanting?: string;

  @IsString()
  @IsOptional()
  glassType?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsNumber()
  @IsOptional()
  reviewCount?: number;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsNumber()
  @IsOptional()
  stockCount?: number;

  @IsNumber()
  @IsOptional()
  pdfPage?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  cloudinaryPublicId?: string;
}

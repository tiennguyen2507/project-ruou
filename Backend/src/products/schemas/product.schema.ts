import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ _id: false })
export class TastingNotes {
  @Prop({ default: '' })
  raw: string;

  @Prop({ default: '' })
  color: string;

  @Prop({ default: '' })
  aroma: string;

  @Prop({ default: '' })
  taste: string;

  @Prop({ default: '' })
  finish?: string;
}

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  sku: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ default: '' })
  originalName: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ default: '', index: true })
  brand: string;

  @Prop({ default: '', index: true })
  country: string;

  @Prop({ default: '' })
  countryCode: string;

  @Prop({ default: '' })
  region: string;

  @Prop({ default: '' })
  category: string;

  @Prop({ default: 'Vang Đỏ', index: true })
  wineType: string;

  @Prop({ default: '' })
  classification: string;

  @Prop({ type: [String], default: [] })
  grapes: string[];

  @Prop({ default: '' })
  alcohol: string;

  @Prop({ default: 0 })
  alcoholNumeric: number;

  @Prop({ default: '750ml' })
  volume: string;

  @Prop({ default: '' })
  vintage: string;

  @Prop({ required: true, default: 0, index: true })
  price: number;

  @Prop({ default: 0 })
  originalPrice: number;

  @Prop({ default: 0 })
  discountPercent: number;

  @Prop({ default: 0 })
  casePrice: number;

  @Prop({ type: TastingNotes, default: () => ({}) })
  tastingNotes: TastingNotes;

  @Prop({ type: [String], default: [] })
  foodPairings: string[];

  @Prop({ default: '16 - 18°C' })
  servingTemp: string;

  @Prop({ default: 'Decant 30 - 45 phút' })
  decanting: string;

  @Prop({ default: 'Ly Bordeaux dáng chuẩn' })
  glassType: string;

  @Prop({ default: 5.0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: null })
  badge: string;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ default: 100 })
  stockCount: number;

  @Prop({ default: 1 })
  pdfPage: number;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isBestSeller: boolean;

  @Prop({ default: '/images/products/santa-carolina-carmenere.jpg' })
  image: string;

  @Prop({ default: null, index: true })
  cloudinaryPublicId?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Text index for search
ProductSchema.index({
  name: 'text',
  originalName: 'text',
  brand: 'text',
  country: 'text',
  region: 'text',
});

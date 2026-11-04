// Generated from BAO GIA 2026 - SHOP 170826.pdf (Công ty CP Huy Phong)
import productsRaw from "./products.json";

export interface WineProduct {
  id: string;
  sku: string;
  name: string;
  originalName: string;
  slug: string;
  brand: string;
  country: string;
  countryCode: string;
  region: string;
  category: string;
  wineType: 'Vang Đỏ' | 'Vang Trắng' | 'Champagne & Sủi' | 'Vang Ngọt' | 'Không Cồn';
  classification: string;
  grapes: string[];
  alcohol: string;
  alcoholNumeric: number;
  volume: string;
  vintage: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  casePrice: number;
  tastingNotes: {
    raw: string;
    color: string;
    aroma: string;
    taste: string;
    finish?: string;
  };
  foodPairings: string[];
  servingTemp: string;
  decanting: string;
  glassType: string;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  inStock: boolean;
  stockCount: number;
  pdfPage: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  image: string;
}

export const productsData: WineProduct[] = productsRaw as unknown as WineProduct[];

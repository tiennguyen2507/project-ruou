// Wine Products definitions and Backend API integration
// 100% Data dynamically loaded from Backend NestJS API (MongoDB + Cloudinary)

export interface WineProduct {
  _id?: string;
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
  cloudinaryPublicId?: string;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

/**
 * Empty fallback array - All data is fetched 100% dynamically from Backend
 */
export const productsData: WineProduct[] = [];

/**
 * Helper to fetch all products from Backend
 */
export async function fetchAllProducts(limit = 200): Promise<WineProduct[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data || [];
  } catch (e) {
    console.error("Failed to fetch products from backend:", e);
    return [];
  }
}

/**
 * Helper to fetch single product by slug from Backend
 */
export async function fetchProductBySlug(slug: string): Promise<WineProduct | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/slug/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (e) {
    console.error(`Failed to fetch product '${slug}' from backend:`, e);
    return null;
  }
}

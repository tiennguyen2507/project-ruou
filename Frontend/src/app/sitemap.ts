import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const currentDate = new Date();

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/san-pham`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bao-gia-2026`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kien-thuc-ruou-vang`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/chinh-sach-dai-ly`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/chinh-sach-doi-tra`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/chinh-sach-giao-hang`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. Dynamic Product Pages (from Backend API)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    const res = await fetch(`${apiUrl}/products?limit=200`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const products = json?.data || [];
      productRoutes = products.map((product: any) => ({
        url: `${baseUrl}/san-pham/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
    }
  } catch (error) {
    console.warn('Sitemap dynamic product generation fallback:', error);
  }

  return [...staticRoutes, ...productRoutes];
}

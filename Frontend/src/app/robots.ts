import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/dashboard',
        disallow: ['/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

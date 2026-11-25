import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/admin/proxy',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/admin/proxy/history',
        destination: '/dashboard/history',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

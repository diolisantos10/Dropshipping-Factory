/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next.js 14.1.x uses this key (serverExternalPackages became stable in 14.2+)
    serverComponentsExternalPackages: ['cheerio', 'axios', 'sharp', 'openai'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.aliexpress.com',
      },
      {
        protocol: 'https',
        hostname: '**.alicdn.com',
      },
    ],
  },
};

module.exports = nextConfig;

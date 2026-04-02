/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent webpack from trying to bundle Node.js-only server packages
  serverExternalPackages: ['cheerio', 'axios', 'sharp'],
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
      },
    ],
    unoptimized: true,
  },
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove eslint from next.config.js - it's no longer supported
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
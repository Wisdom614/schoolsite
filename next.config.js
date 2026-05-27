/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'supabase.co'],
    unoptimized: true,
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors during build
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
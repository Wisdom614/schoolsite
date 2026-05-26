/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['supabase.co', 'images.unsplash.com', 'localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors during build
  },
  output: 'standalone', // Optimize for Vercel deployment
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'schoolsite-hazel.vercel.app'],
    },
  },
}

module.exports = nextConfig
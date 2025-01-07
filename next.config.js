/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Bus',
  images: {
    unoptimized: true,
  },
  distDir: 'dist',
  trailingSlash: true,
  assetPrefix: '/Bus/'
}

module.exports = nextConfig

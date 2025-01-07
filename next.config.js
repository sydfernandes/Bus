/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Bus',
  images: {
    unoptimized: true,
  },
  assetPrefix: '/Bus/',
  trailingSlash: true,
  distDir: 'out'
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Bus',
  images: {
    unoptimized: true,
  },
  assetPrefix: '/Bus/',
}

module.exports = nextConfig

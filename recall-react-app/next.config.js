/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing from parent directory (shared package)
  experimental: {
    externalDir: true,
  },
  // Ensure shared package is transpiled
  transpilePackages: ['@shared'],
}

module.exports = nextConfig

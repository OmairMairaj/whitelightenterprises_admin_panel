/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true
});

const nextConfig = {
  images: {
    domains: ['utfs.io', 'localhost', 'backend.biginvitation.com', ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://whitelightenterprises-backend.vercel.app/admin/:path*'
      }
    ]
  }
};

module.exports = withPWA(nextConfig);

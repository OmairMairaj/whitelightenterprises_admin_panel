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
  }
};

module.exports = withPWA(nextConfig);

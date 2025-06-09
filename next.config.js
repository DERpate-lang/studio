/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // مهم جدًا لـ SSR على Vercel
  experimental: {
    serverActions: true, // لو بتستخدم Server Actions
  },
};

module.exports = nextConfig;

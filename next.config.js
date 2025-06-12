// next.config.js
// This file is intentionally kept minimal to prefer next.config.ts.
// All primary Next.js configuration should be managed in next.config.ts.

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ktkbkkvkqirkarnobefz.supabase.co', // Your Supabase project hostname
        port: '',
        pathname: '/storage/v1/object/public/**', // Allow access to public storage objects
      },
    ],
  },
};

module.exports = nextConfig;

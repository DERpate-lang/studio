
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    let baseExternals = {};
    if (Array.isArray(config.externals)) {
      config.externals.forEach((val, idx) => {
        if (val !== undefined && val !== null) { // Skip undefined/null
          baseExternals[idx.toString()] = val;
        }
      });
    } else if (config.externals && typeof config.externals === 'object') {
      baseExternals = config.externals;
    }
    
    config.externals = {
      ...baseExternals,
      'socket.io': 'socket.io', // Ensure socket.io is present
    };
    return config;
  },
};

module.exports = nextConfig;

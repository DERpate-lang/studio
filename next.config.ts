
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
  webpack: (config, { isServer }) => {
    // Merge with existing externals, if any
    config.externals = {
      ...(config.externals || {}),
      'socket.io': 'socket.io',
    };
    return config;
  },
};

export default nextConfig;

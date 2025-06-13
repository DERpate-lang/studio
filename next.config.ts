
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
    let baseExternals: Record<string, any> = {};
    if (Array.isArray(config.externals)) {
      config.externals.forEach((val, idx) => {
        if (val !== undefined && val !== null) { // Skip undefined/null
          baseExternals[idx.toString()] = val;
        }
      });
    } else if (config.externals && typeof config.externals === 'object') {
      baseExternals = config.externals as Record<string, any>;
    }
    
    config.externals = {
      ...baseExternals,
      'socket.io': 'socket.io', // Ensure socket.io is present
    };
    return config;
  },
};

export default nextConfig;

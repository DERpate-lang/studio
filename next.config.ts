
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
    // Ensure config.externals is initialized if not present, defaulting to an array.
    if (!config.externals) {
      config.externals = [];
    }

    // Add socket.io to the externals.
    // Next.js often uses an array for server-side externals.
    if (Array.isArray(config.externals)) {
      config.externals.push('socket.io');
    } else if (typeof config.externals === 'object' && config.externals !== null) {
      // If it's already an object, add to it.
      (config.externals as Record<string, any>)['socket.io'] = 'socket.io';
    } else {
      // If it's a string, RegExp, or function, this might need specific handling.
      // For now, attempting to add it as if it could be an array.
      // This case might need adjustment based on the actual type of config.externals if it's not array/object.
      // However, typical Next.js externals are arrays or objects.
      // Fallback: Re-assign as an array with the original and new external.
      const originalExternal = config.externals;
      config.externals = [originalExternal, 'socket.io'].filter(Boolean); // filter(Boolean) to remove potential undefined/null from originalExternal if it was so
    }

    return config;
  },
};

export default nextConfig;

// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Server Actions are stable and enabled by default in Next.js 14+
  // The old experimental.serverActions flag is no longer needed or structured differently.
  // Removing it relies on the default behavior.
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  webpack: (config, { isServer }) => {
    // Handle leaflet on server side
    if (isServer) {
      config.externals = [...(config.externals || []), 'leaflet'];
    }
    return config;
  },
  experimental: {
    esmExternals: 'loose'
  }
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Jangan include pg dan modules server-only lainnya di client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pg: false,
        'pg-pool': false,
        'pg-protocol': false,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // CRITICAL: Static export cho Capacitor
  distDir: 'out',
  trailingSlash: true, // Recommended for static export

  // Disable image optimization vì không work với static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Giữ lại các config khác nếu có
  allowedDevOrigins: ['192.168.0.104'],
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for Vercel
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
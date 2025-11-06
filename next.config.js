/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude browser-only modules from server-side bundle
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "canvas",
        "pdfjs-dist": "pdfjs-dist",
      });
    }
    return config;
  },
};

module.exports = nextConfig;

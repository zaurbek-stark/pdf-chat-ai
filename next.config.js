/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.externals.push({ sharp: 'commonjs sharp', canvas: 'commonjs canvas' })
    return config
  }
};

module.exports = nextConfig

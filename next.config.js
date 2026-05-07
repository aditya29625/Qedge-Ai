/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  distDir: process.env.VERCEL ? '.next' : path.join(require('os').homedir(), '.quantumedge-next'),
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: 'filesystem',
        cacheDirectory: path.join(require('os').homedir(), '.quantumedge-cache'),
        buildDependencies: { config: [__filename] },
      };
    }
    return config;
  },
};

module.exports = nextConfig;

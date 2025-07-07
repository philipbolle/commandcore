const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.resolve.alias['@agents'] = path.resolve(__dirname, 'packages/agents');
    return config;
  },
};

module.exports = nextConfig;

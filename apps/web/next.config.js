const path = require('path');

module.exports = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.alias['@agents'] = path.resolve(__dirname, '../../packages/agents');
    return config;
  },
};

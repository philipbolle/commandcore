const path = require('path');

module.exports = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias['@agents'] = path.resolve(__dirname, '../../packages/agents');
    return config;
  },
};

// next.config.js
module.exports = {
  webpack: (config, { dev }) => {
    if (!dev) {
      // Only modify 'devtool' in production
      config.devtool = 'source-map';
    }
    return config;
  },
};

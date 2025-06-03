// next.config.js
module.exports = {
  experimental: {
    // Allow ngrok domain during development for cross-origin requests
    allowedDevOrigins: ['https://dtuaitsoc.ngrok.dev'],
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      // Only modify 'devtool' in production
      config.devtool = 'source-map';
    }
    return config;
  },
};

// next.config.js

const isLocal = process.env.NODE_ENV === 'development';

export default {
  images: {
    domains: [],
  },
  webpack(config, { dev }) {
    if (dev) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
  ...(isLocal
    ? {} // Local environment: no additional configuration
    : {
        functions: {
        },
      }),
};

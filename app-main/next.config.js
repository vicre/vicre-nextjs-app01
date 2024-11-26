const withTM = require('next-transpile-modules')(['mermaid', 'lodash-es']); // Add ES modules here

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If using Next.js 13 with the App Router, you might have additional configurations
};

module.exports = withTM(nextConfig);
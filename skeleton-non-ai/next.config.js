/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated experimental.turbo config
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid eval()-based devtool to prevent stray encoding issues in eval strings
      config.devtool = 'source-map';
    }
    return config;
  },
};

module.exports = nextConfig;

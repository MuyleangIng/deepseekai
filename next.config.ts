/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode if causing issues
  reactStrictMode: false,
  
  // Ignore various build-time errors
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack configuration to suppress warnings
  webpack: (config, { isServer }) => {
    // Ignore specific warnings and deprecation notices
    config.ignoreWarnings = [
      { module: /punycode/ },
      { message: /Critical dependency/ },
      { message: /Module not found/ },
      { message: /Failed to parse source map/ },
      { message: /DeprecationWarning/ },
    ];

    // Handle potential module resolution issues
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,  // Resolve filesystem module issues
      net: false,
      tls: false
    };

    // Additional error handling for server-side builds
    if (isServer) {
      config.infrastructureLogging = {
        level: 'error'
      };
    }

    return config;
  },

  // Experimental features
  experimental: {
    scrollRestoration: true,
    
    // Increase page data limit
    largePageDataBytes: 256 * 1000,
  },

  // Disable powered by header for security
  poweredByHeader: false,

  // Configure error handling
  productionBrowserSourceMaps: false,
};

export default nextConfig;
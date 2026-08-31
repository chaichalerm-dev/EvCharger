import type { NextConfig } from 'next';

import { BASE_SECURITY_HEADERS } from './src/config/security-headers';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: BASE_SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;

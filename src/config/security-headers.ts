export interface SecurityHeader {
  key: string;
  value: string;
}

/**
 * Headers that do not depend on a request-specific nonce. They are also
 * applied through next.config so error responses and non-page resources keep
 * the same browser protections where the hosting runtime supports it.
 */
export const BASE_SECURITY_HEADERS: SecurityHeader[] = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-XSS-Protection", value: "0" },
];

/**
 * The application deliberately permits HTTPS connections because provider
 * endpoints can be changed from Settings. This keeps the frontend provider
 * abstraction usable without allowing arbitrary scripts, frames, or objects.
 */
export function createContentSecurityPolicy(
  nonce: string,
  isDevelopment = false,
): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "media-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

export function createPageSecurityHeaders(
  nonce: string,
  isDevelopment = false,
): SecurityHeader[] {
  return [
    ...BASE_SECURITY_HEADERS,
    {
      key: "Content-Security-Policy",
      value: createContentSecurityPolicy(nonce, isDevelopment),
    },
  ];
}

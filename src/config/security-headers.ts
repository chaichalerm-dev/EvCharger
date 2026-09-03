export interface SecurityHeader {
  key: string;
  value: string;
}

/**
 * Header ที่ไม่ขึ้นกับ nonce เฉพาะ request นี้ยังถูกใช้ผ่าน next.config ด้วย เพื่อให้ error response
 * และ resource ที่ไม่ใช่หน้าเว็บได้รับการป้องกันแบบเดียวกัน ในกรณีที่ hosting runtime รองรับ
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
 * ระบบเปิด HTTPS connection ทุกปลายทางโดยตั้งใจ เพราะ endpoint ของ provider แก้ได้จากหน้า Settings
 * ทำให้ยังใช้งาน provider abstraction ของ frontend ได้ โดยไม่เปิดให้รัน script/frame/object ตามใจ
 */
export function createContentSecurityPolicy(
  nonce: string,
  isDevelopment = false,
): string {
  const directives = [
    "default-src 'self'",
    // 'unsafe-eval' เปิดเฉพาะ dev mode เพราะ Vite/Next HMR ต้องใช้ ใน production ต้องปิดเสมอ
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    // 'unsafe-inline' จำเป็นเพราะหลาย component ใช้ inline style สำหรับสีที่มาจาก config (เช่นสี
    // layer บนแผนที่) — nonce/strict-dynamic ด้านบนยังกัน script injection อยู่
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

import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/noto-sans/index.css";
import "@fontsource-variable/noto-sans-thai/index.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import "./map.css";
import "./ui.css";
import "./operations.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_ORIGIN || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: "EV Atlas Thailand | Expansion Intelligence",
  description: "A frontend-first decision support prototype for EV charging expansion in Thailand.",
  applicationName: "EV Atlas Thailand",
  icons: {
    icon: [{ url: "/ev-atlas-electric.svg", type: "image/svg+xml" }],
    shortcut: "/ev-atlas-electric.svg",
  },
  openGraph: {
    title: "EV Atlas Thailand",
    description: "Location & Expansion Intelligence for EV charging infrastructure decisions.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "EV Atlas Thailand — Location & Expansion Intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EV Atlas Thailand",
    description: "Location & Expansion Intelligence for EV charging infrastructure decisions.",
    images: ["/og.png"],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // nonce มาจาก middleware (ดู src/config/security-headers.ts) เพื่อผ่าน CSP script-src ที่เข้มงวด
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  // body เริ่มต้นเป็น inert (กด/โฟกัสไม่ได้ พร้อมข้อความ "Loading…" จาก body[inert]::after ใน
  // globals.css) จนกว่า Providers จะ mount และปลด inert ออก ป้องกันผู้ใช้โต้ตอบก่อน hydration เสร็จ
  // suppressHydrationWarning เพราะ next-themes และ AppProvider ปรับ class/lang หลัง mount โดยเจตนา
  return <html lang="th" suppressHydrationWarning><body inert suppressHydrationWarning><Providers nonce={nonce}>{children}</Providers></body></html>;
}

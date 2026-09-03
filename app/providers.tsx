"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { AppProvider } from "@/src/store/app-context";
export function Providers({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  // ปลด inert ที่ layout.tsx ตั้งไว้ทันทีที่ provider tree mount เสร็จ — ทำใน effect (ไม่ใช่ระหว่าง
  // render) เพื่อให้แน่ใจว่า React hydrate เสร็จก่อนผู้ใช้เริ่มโต้ตอบกับหน้าได้
  useEffect(() => {
    document.body.inert = false;
    document.body.removeAttribute("inert");
    document.body.dataset.interactive = "true";
  }, []);
  // defaultTheme="light" คือค่าเริ่มต้นครั้งแรกตาม AI.md §7 แต่ enableSystem ยังให้ผู้ใช้ที่เคย
  // เลือก "ตามระบบ" เห็นธีมตาม OS ได้ตามปกติ
  return <ThemeProvider attribute="class" defaultTheme="light" enableSystem nonce={nonce}><QueryClientProvider client={queryClient}><AppProvider>{children}</AppProvider></QueryClientProvider></ThemeProvider>;
}

"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { AppProvider } from "@/src/store/app-context";
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  useEffect(() => {
    document.body.inert = false;
    document.body.removeAttribute("inert");
    document.body.dataset.interactive = "true";
  }, []);
  return <ThemeProvider attribute="class" defaultTheme="light" enableSystem><QueryClientProvider client={queryClient}><AppProvider>{children}</AppProvider></QueryClientProvider></ThemeProvider>;
}

import type { Metadata } from "next";
import { AppShell } from "@/src/components/layout/app-shell";
import { SiteIntelligence } from "@/src/features/sites/site-intelligence";

export const metadata: Metadata = { title: "Site Intelligence | EV Atlas Thailand", description: "Site intelligence loaded from the configured company Business API.", openGraph: { images: [] }, twitter: { images: [] } };
export default function SitePage() { return <AppShell><SiteIntelligence /></AppShell>; }

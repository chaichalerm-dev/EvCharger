import type { Metadata } from "next";
import { AppShell } from "@/src/components/layout/app-shell";
import { PartnerDetail } from "@/src/features/partners/partner-detail";

export const metadata: Metadata = { title: "Partner | EV Atlas Thailand", description: "Partner and branch data loaded from the configured company Business API.", openGraph: { images: [] }, twitter: { images: [] } };
export default function PartnerPage() { return <AppShell><PartnerDetail /></AppShell>; }

import { AppShell } from "@/src/components/layout/app-shell";
import { DashboardView } from "@/src/features/dashboard/dashboard-view";

export default function HomePage() {
  return <AppShell><DashboardView /></AppShell>;
}

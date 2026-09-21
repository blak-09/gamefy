"use client";

import { AppShell } from "@/components/Navigation";
import { useApp } from "@/lib/store";

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  const { hydrated } = useApp();
  if (!hydrated) return <div className="min-h-screen bg-slate-50" aria-busy="true" />;
  return <AppShell role="club">{children}</AppShell>;
}

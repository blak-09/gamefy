"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/Navigation";
import { useApp } from "@/lib/store";

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  const { hydrated, profile } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !profile) router.replace("/player/onboarding");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile) {
    return <div className="min-h-screen bg-slate-50" aria-busy="true" />;
  }

  return <AppShell role="player">{children}</AppShell>;
}

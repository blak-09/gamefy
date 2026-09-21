"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Building2,
  ClipboardList,
  Compass,
  LayoutDashboard,
  RefreshCcw,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn, initials } from "@/lib/utils";
import { useApp } from "@/lib/store";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const PLAYER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/player/dashboard", icon: LayoutDashboard },
  { label: "Opportunities", href: "/player/opportunities", icon: Compass },
  { label: "My Applications", href: "/player/applications", icon: ClipboardList },
  { label: "Profile", href: "/player/profile", icon: UserRound },
];

const CLUB_NAV: NavItem[] = [
  { label: "Dashboard", href: "/club/dashboard", icon: LayoutDashboard },
  { label: "Opportunities", href: "/club/opportunities", icon: Compass },
  { label: "Applications", href: "/club/applications", icon: Users },
  { label: "Club Profile", href: "/club/profile", icon: Building2 },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const { profile, clubProfile } = useApp();
  const items = role === "player" ? PLAYER_NAV : CLUB_NAV;
  const identity = role === "player" ? profile?.name ?? "Player" : clubProfile.name;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo href={role === "player" ? "/player/dashboard" : "/club/dashboard"} compactOnMobile />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              title="Switch role"
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:flex"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Switch role
            </Link>
            <Link
              href={role === "player" ? "/player/profile" : "/club/profile"}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-medium text-slate-800 transition-colors hover:border-slate-300"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white",
                  role === "player" ? "bg-blue-600" : "bg-emerald-600",
                )}
              >
                {role === "player" ? initials(identity) : <Building2 className="h-3.5 w-3.5" />}
              </span>
              <span className="max-w-[120px] truncate">{identity}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
        aria-label="Primary mobile"
      >
        <div className="grid grid-cols-4">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-blue-600" : "text-slate-500",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation role={role} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-12">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500 sm:text-base">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}

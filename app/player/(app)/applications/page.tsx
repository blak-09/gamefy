"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, ClipboardList, MapPin } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { EmptyState } from "@/components/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { useApp } from "@/lib/store";
import { cn, daysUntil, formatDate, formatDateRange } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/types";

type Tab = "applied" | "upcoming" | "completed";

const TABS: { key: Tab; label: string; statuses: ApplicationStatus[] }[] = [
  { key: "applied", label: "Applied", statuses: ["applied", "registered"] },
  { key: "upcoming", label: "Upcoming", statuses: ["upcoming"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
];

const TAB_EMPTY: Record<Tab, { title: string; description: string }> = {
  applied: {
    title: "No applications yet",
    description: "Opportunities you apply to will show up here so you can track them.",
  },
  upcoming: {
    title: "Nothing upcoming",
    description: "Confirmed events you are taking part in will appear here.",
  },
  completed: {
    title: "No completed events",
    description: "Past trials and tournaments you took part in will be listed here.",
  },
};

export default function ApplicationsPage() {
  const { applications, opportunities } = useApp();
  const [tab, setTab] = useState<Tab>("applied");

  const byTab = useMemo(() => {
    const map: Record<Tab, Application[]> = { applied: [], upcoming: [], completed: [] };
    for (const t of TABS) {
      map[t.key] = applications
        .filter((a) => t.statuses.includes(a.status))
        .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
    }
    return map;
  }, [applications]);

  const items = byTab[tab];

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle="Everything you have applied to, what is coming up, and what you have completed."
        action={
          <ButtonLink href="/player/opportunities" variant="secondary" size="sm">
            Find more opportunities
          </ButtonLink>
        }
      />

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 sm:inline-flex" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
              tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                tab === t.key ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600",
              )}
            >
              {byTab[t.key].length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={TAB_EMPTY[tab].title}
            description={TAB_EMPTY[tab].description}
            action={
              <ButtonLink href="/player/opportunities" size="sm">
                Browse opportunities
              </ButtonLink>
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.map((application) => {
              const opp = opportunities.find((o) => o.id === application.opportunityId);
              if (!opp) return null;
              const days = daysUntil(opp.date);
              return (
                <li key={application.id}>
                  <Card hover padding="sm" className="sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <TypeBadge type={opp.type} />
                          <StatusBadge status={application.status} />
                        </div>
                        <Link
                          href={`/player/opportunities/${opp.id}`}
                          className="mt-2 block text-lg font-semibold tracking-tight text-slate-900 hover:underline"
                        >
                          {opp.title}
                        </Link>
                        <p className="text-sm text-slate-500">{opp.organizer}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            {formatDateRange(opp.date, opp.endDate)}
                            {application.status === "upcoming" && days >= 0 && (
                              <span className="text-violet-700">· in {days} {days === 1 ? "day" : "days"}</span>
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {opp.city}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <p className="text-xs text-slate-400">
                          {application.status === "completed" ? "Took part" : "Applied"} ·{" "}
                          {formatDate(application.appliedAt.slice(0, 10), "short")}
                        </p>
                        <Link
                          href={`/player/opportunities/${opp.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
                        >
                          View details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

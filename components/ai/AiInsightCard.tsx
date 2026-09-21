"use client";

import { useMemo } from "react";
import { AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { DEMO_PLAYERS } from "@/data/players";
import { useApp } from "@/lib/store";
import { dashboardInsights, type Insight } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { Card } from "../ui/Card";
import { AiBadge, AiNote } from "./AiBadge";

const toneMeta: Record<Insight["tone"], { icon: typeof Lightbulb; className: string }> = {
  positive: { icon: TrendingUp, className: "bg-emerald-50 text-emerald-600" },
  neutral: { icon: Lightbulb, className: "bg-blue-50 text-blue-600" },
  warning: { icon: AlertTriangle, className: "bg-amber-50 text-amber-600" },
};

export function AiInsightCard({ className }: { className?: string }) {
  const { clubProfile, opportunities, clubApplicants, profile } = useApp();

  const insights = useMemo(() => {
    const mine = opportunities.filter((o) => o.organizerId === clubProfile.id);
    const pool = profile ? [profile, ...DEMO_PLAYERS] : DEMO_PLAYERS;
    return dashboardInsights(mine, clubApplicants, pool);
  }, [opportunities, clubApplicants, clubProfile.id, profile]);

  return (
    <Card padding="sm" className={cn("border-violet-100 bg-gradient-to-br from-violet-50/60 to-white", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">AI Insight</p>
        <AiBadge label="AI Insight" icon="🧠" />
      </div>
      <ul className="mt-3 space-y-3">
        {insights.map((insight) => {
          const meta = toneMeta[insight.tone];
          const Icon = meta.icon;
          return (
            <li key={insight.text} className="flex gap-3">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", meta.className)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm leading-relaxed text-slate-700">{insight.text}</p>
            </li>
          );
        })}
      </ul>
      <AiNote className="mt-3">Generated from your opportunities and applications in this prototype.</AiNote>
    </Card>
  );
}

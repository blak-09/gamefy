"use client";

import { useMemo } from "react";
import { CheckCircle2, CircleDashed, Inbox, XCircle } from "lucide-react";
import type { ClubApplicant, Opportunity } from "@/types";
import { summarizeApplications } from "@/lib/ai";
import { Card } from "../ui/Card";
import { AiBadge, AiNote } from "./AiBadge";

interface Props {
  applicants: ClubApplicant[];
  opportunities: Opportunity[];
  /** When the list is filtered to one opportunity */
  focus?: Opportunity;
}

export function AiApplicationSummary({ applicants, opportunities, focus }: Props) {
  const summary = useMemo(
    () => summarizeApplications(applicants, opportunities, focus),
    [applicants, opportunities, focus],
  );

  const stats = [
    { icon: Inbox, label: "applications received", value: summary.total, className: "bg-slate-100 text-slate-700" },
    { icon: CheckCircle2, label: "strong matches", value: summary.strong, className: "bg-emerald-50 text-emerald-700" },
    { icon: CircleDashed, label: "players require review", value: summary.review, className: "bg-amber-50 text-amber-700" },
    {
      icon: XCircle,
      label: "do not currently match the requirements",
      value: summary.noMatch,
      className: "bg-slate-100 text-slate-500",
    },
  ];

  return (
    <Card className="border-violet-100 bg-gradient-to-br from-violet-50/50 to-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          AI Application Summary
          {focus && <span className="font-normal text-slate-500"> · {focus.title}</span>}
        </h2>
        <AiBadge label="AI Summary" icon="🧠" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-3.5 py-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.className}`}>
              <s.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-semibold leading-none text-slate-900">{s.value}</p>
              <p className="mt-1 text-xs leading-snug text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200/70">
        “{summary.insight}”
      </p>
      <AiNote className="mt-2">
        Each applicant is checked against the age, position, location and level requirements of the opportunity
        they applied to.
      </AiNote>
    </Card>
  );
}

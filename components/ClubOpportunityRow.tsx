import Link from "next/link";
import { ArrowRight, CalendarDays, Hourglass, Users } from "lucide-react";
import type { Opportunity } from "@/types";
import { daysUntil, formatDate, formatDateRange } from "@/lib/utils";
import { Badge, TypeBadge, type BadgeTone } from "./ui/Badge";
import { Card } from "./ui/Card";

export function clubOpportunityStatus(opp: Opportunity): { label: string; tone: BadgeTone } {
  if (daysUntil(opp.date) < 0) return { label: "Completed", tone: "neutral" };
  if (daysUntil(opp.deadline) < 0) return { label: "Registration closed", tone: "amber" };
  return { label: "Active", tone: "green" };
}

export function ClubOpportunityRow({
  opportunity,
  applicantCount,
  newCount,
}: {
  opportunity: Opportunity;
  applicantCount: number;
  newCount: number;
}) {
  const status = clubOpportunityStatus(opportunity);
  return (
    <Card hover padding="sm" className="sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={opportunity.type} />
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
            {!opportunity.isDemo && <Badge tone="blue">Published by you</Badge>}
          </div>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{opportunity.title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {formatDateRange(opportunity.date, opportunity.endDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Hourglass className="h-4 w-4 text-slate-400" />
              Deadline {formatDate(opportunity.deadline, "short")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              {applicantCount} {applicantCount === 1 ? "application" : "applications"}
              {newCount > 0 && <span className="font-medium text-blue-700">· {newCount} new</span>}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/club/applications?opportunity=${opportunity.id}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            View Applications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

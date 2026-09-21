"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, ChevronDown, Hourglass, MapPin, ShieldCheck } from "lucide-react";
import type { Opportunity } from "@/types";
import type { MatchResult } from "@/lib/matching";
import { cn, deadlineText, formatDateRange } from "@/lib/utils";
import { distanceLabel } from "@/lib/geo";
import { Card } from "./ui/Card";
import { Badge, TypeBadge } from "./ui/Badge";
import { MatchPill, MatchReasons, SmartMatchLabel } from "./MatchReasons";

interface OpportunityCardProps {
  opportunity: Opportunity;
  match?: MatchResult;
  applied?: boolean;
  /** Show a collapsible "Why this matches you" section */
  showWhy?: boolean;
  defaultOpen?: boolean;
  isNew?: boolean;
}

export function OpportunityCard({
  opportunity,
  match,
  applied,
  showWhy = false,
  defaultOpen = false,
  isNew,
}: OpportunityCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const deadline = deadlineText(opportunity.deadline);
  const distance = match ? distanceLabel(match.distanceKm, match.sameCity) : undefined;
  const href = `/player/opportunities/${opportunity.id}`;

  return (
    <Card hover padding="none" className="flex flex-col overflow-hidden">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={opportunity.type} />
          <Badge tone="neutral">{opportunity.ageLabel}</Badge>
          {isNew && <Badge tone="green">Just published</Badge>}
          {opportunity.isDemo && (
            <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-slate-400">Demo</span>
          )}
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-slate-900">
          <Link href={href} className="hover:underline">
            {opportunity.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">{opportunity.organizer}</p>

        <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span>
              {opportunity.city}
              {distance && <span className="text-slate-400"> · {distance}</span>}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{formatDateRange(opportunity.date, opportunity.endDate)}</span>
          </li>
          <li className={cn("flex items-center gap-2", deadline.urgent && "font-medium text-amber-700")}>
            <Hourglass className={cn("h-4 w-4 shrink-0", deadline.urgent ? "text-amber-500" : "text-slate-400")} />
            <span>{deadline.text}</span>
          </li>
        </ul>

        {match && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MatchPill match={match} />
            {match.eligibleAge && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Eligible for your age group
              </span>
            )}
          </div>
        )}

        {showWhy && match && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-medium text-slate-800"
              aria-expanded={open}
            >
              <span className="flex items-center gap-2">
                Why this opportunity matches you
                <SmartMatchLabel />
              </span>
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <div className="animate-fade-in border-t border-slate-100 px-3.5 py-3">
                <MatchReasons match={match} compact />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
        {applied ? (
          <Badge tone="green" dot>
            Applied
          </Badge>
        ) : (
          <span className="text-xs text-slate-400">{opportunity.venue.split(",")[0]}</span>
        )}
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900"
        >
          View Opportunity
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

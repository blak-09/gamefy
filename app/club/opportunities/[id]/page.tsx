"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock,
  Hourglass,
  MapPin,
  Megaphone,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, ApplicantStatusBadge, TypeBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ProfileAvatar } from "@/components/ProfileCard";
import { clubOpportunityStatus } from "@/components/ClubOpportunityRow";
import { AiPlayerMatches } from "@/components/ai/AiPlayerMatches";
import { useApp } from "@/lib/store";
import { scorePlayer } from "@/lib/ai";
import { daysUntil, deadlineText, formatDate, formatDateRange } from "@/lib/utils";

export default function ClubOpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const { clubProfile, opportunities, clubApplicants } = useApp();
  const opportunity = opportunities.find((o) => o.id === params.id && o.organizerId === clubProfile.id);

  const applicants = useMemo(
    () =>
      clubApplicants
        .filter((a) => a.opportunityId === opportunity?.id)
        .map((a) => ({ applicant: a, match: opportunity ? scorePlayer(a, opportunity) : null }))
        .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0)),
    [clubApplicants, opportunity],
  );

  if (!opportunity) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Opportunity not found"
        description="It may have been removed, or it belongs to a different club."
        action={
          <ButtonLink href="/club/opportunities" variant="secondary" size="sm">
            Back to opportunities
          </ButtonLink>
        }
      />
    );
  }

  const status = clubOpportunityStatus(opportunity);
  const deadline = deadlineText(opportunity.deadline);
  const isActive = daysUntil(opportunity.date) >= 0;
  const tiers = {
    strong: applicants.filter((a) => a.match?.tier === "strong").length,
    review: applicants.filter((a) => a.match?.tier === "review").length,
    noMatch: applicants.filter((a) => a.match?.tier === "no-match").length,
  };

  const facts = [
    { icon: CalendarDays, label: "Date", value: formatDateRange(opportunity.date, opportunity.endDate) },
    { icon: Clock, label: "Time", value: opportunity.time },
    { icon: MapPin, label: "Venue", value: opportunity.venue },
    { icon: Users, label: "Age group", value: `${opportunity.ageLabel} · ${opportunity.ageMin}–${opportunity.ageMax} years` },
    {
      icon: ShieldCheck,
      label: "Position · Level",
      value: `${opportunity.positions === "any" ? "All positions" : opportunity.positions.join(", ")} · ${
        opportunity.levels === "all" ? "All levels" : opportunity.levels.join(" / ")
      }`,
    },
    { icon: Hourglass, label: "Registration deadline", value: formatDate(opportunity.deadline) },
  ];

  return (
    <div>
      <Link
        href="/club/opportunities"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Your opportunities
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={opportunity.type} />
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
            {!opportunity.isDemo && <Badge tone="blue">Published by you</Badge>}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{opportunity.title}</h1>
          <p className={`mt-1.5 text-sm ${deadline.urgent && !deadline.closed ? "font-medium text-amber-700" : "text-slate-500"}`}>
            {deadline.text}
          </p>
        </div>
        <ButtonLink href={`/club/applications?opportunity=${opportunity.id}`}>
          View Applications
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {isActive ? (
            <AiPlayerMatches opportunities={[opportunity]} initialVisible={6} />
          ) : (
            <Card>
              <p className="text-sm text-slate-600">
                This event has already taken place, so player matching is switched off. Applications are kept for
                your records below.
              </p>
            </Card>
          )}

          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Applications</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {applicants.length} received · ranked by how well they fit
                </p>
              </div>
              <div className="hidden gap-2 sm:flex">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {tiers.strong} strong
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                  <CircleDashed className="h-3.5 w-3.5" /> {tiers.review} review
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <XCircle className="h-3.5 w-3.5" /> {tiers.noMatch} no match
                </span>
              </div>
            </div>
            {applicants.length === 0 ? (
              <p className="border-t border-slate-100 px-5 py-6 text-sm text-slate-500">No applications yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {applicants.map(({ applicant, match }) => (
                  <li key={applicant.id} className="flex items-center gap-3 px-5 py-3">
                    <ProfileAvatar name={applicant.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{applicant.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {applicant.age} · {applicant.position} · {applicant.location} · {applicant.level}
                      </p>
                    </div>
                    {match && (
                      <span
                        className={`hidden text-xs font-semibold sm:block ${
                          match.tier === "strong" ? "text-emerald-700" : match.tier === "review" ? "text-amber-700" : "text-slate-400"
                        }`}
                      >
                        {match.score}%
                      </span>
                    )}
                    <ApplicantStatusBadge status={applicant.status} />
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-slate-100 px-5 py-3">
              <Link
                href={`/club/applications?opportunity=${opportunity.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Review and shortlist
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <h2 className="text-base font-semibold text-slate-900">Details</h2>
            <dl className="mt-4 space-y-4">
              {facts.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{f.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-900">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-slate-600">{opportunity.description}</p>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-slate-900">Entry requirements</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {opportunity.entryRequirements.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

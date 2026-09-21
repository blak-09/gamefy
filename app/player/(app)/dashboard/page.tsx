"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CalendarCheck, ClipboardList, Eye, Hourglass, PencilLine } from "lucide-react";
import { OpportunityCard } from "@/components/OpportunityCard";
import { ProfileAvatar } from "@/components/ProfileCard";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useApp } from "@/lib/store";
import { rankOpportunities } from "@/lib/matching";
import { daysUntil, deadlineText, greeting } from "@/lib/utils";

export default function PlayerDashboardPage() {
  const { profile, opportunities, applications, viewedIds } = useApp();

  const appliedIds = useMemo(() => new Set(applications.map((a) => a.opportunityId)), [applications]);

  const recommended = useMemo(() => {
    if (!profile) return [];
    const active = opportunities.filter((o) => daysUntil(o.date) >= 0 && !appliedIds.has(o.id));
    return rankOpportunities(profile, active).slice(0, 4);
  }, [profile, opportunities, appliedIds]);

  const closingSoon = useMemo(
    () =>
      opportunities
        .filter((o) => !appliedIds.has(o.id))
        .filter((o) => {
          const d = daysUntil(o.deadline);
          return d >= 0 && d <= 7;
        })
        .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
        .slice(0, 3),
    [opportunities, appliedIds],
  );

  if (!profile) return null;

  const firstName = profile.name.split(" ")[0];
  const appliedCount = applications.filter((a) => a.status === "applied" || a.status === "registered").length;
  const upcomingCount = applications.filter((a) => a.status === "upcoming").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProfileAvatar name={profile.name} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {greeting()}, {firstName} 👋
            </h1>
            <p className="mt-1 text-slate-500">Here are opportunities that match your profile.</p>
          </div>
        </div>
        <Link
          href="/player/profile"
          className="group inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300"
        >
          <span>
            {profile.age} <span className="text-slate-300">|</span> {profile.position}{" "}
            <span className="text-slate-300">|</span> {profile.location} <span className="text-slate-300">|</span>{" "}
            {profile.level}
          </span>
          <PencilLine className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700" />
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Recommended */}
        <section>
          <SectionTitle
            title="Recommended For You"
            subtitle="Ranked by age, position, location, level and registration window."
            action={
              <Link
                href="/player/opportunities"
                className="hidden items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 sm:inline-flex"
              >
                See all
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {recommended.map(({ opportunity, match }, i) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                match={match}
                showWhy
                defaultOpen={i === 0}
                isNew={!opportunity.isDemo}
              />
            ))}
          </div>
          <Link
            href="/player/opportunities"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 sm:hidden"
          >
            See all opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Side column */}
        <aside className="space-y-5">
          <Card padding="sm">
            <p className="text-sm font-semibold text-slate-900">Your journey</p>
            <ul className="mt-3 divide-y divide-slate-100">
              <li className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <ClipboardList className="h-4 w-4 text-blue-500" /> Applications
                </span>
                <span className="text-sm font-semibold text-slate-900">{appliedCount}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarCheck className="h-4 w-4 text-violet-500" /> Upcoming
                </span>
                <span className="text-sm font-semibold text-slate-900">{upcomingCount}</span>
              </li>
              <li className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <Eye className="h-4 w-4 text-slate-400" /> Opportunities viewed
                </span>
                <span className="text-sm font-semibold text-slate-900">{viewedIds.length}</span>
              </li>
            </ul>
            <Link
              href="/player/applications"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              View My Applications
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card padding="sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Closing soon</p>
              <Hourglass className="h-4 w-4 text-amber-500" />
            </div>
            {closingSoon.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No deadlines in the next 7 days.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {closingSoon.map((o) => {
                  const d = deadlineText(o.deadline);
                  return (
                    <li key={o.id}>
                      <Link href={`/player/opportunities/${o.id}`} className="group block">
                        <p className="text-sm font-medium text-slate-900 group-hover:underline">{o.title}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                          <Badge tone={d.urgent ? "amber" : "neutral"}>{d.text.replace("Registration ", "")}</Badge>
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">How matching works</p>
            <p className="mt-1">
              Each opportunity is checked against your age, position, location, level and its registration
              deadline. Open any card to see why it matches.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

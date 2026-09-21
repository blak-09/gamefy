"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Building2, ClipboardList, Megaphone, Plus, UserPlus, Users } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { ClubOpportunityRow } from "@/components/ClubOpportunityRow";
import { ButtonLink } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ApplicantStatusBadge } from "@/components/ui/Badge";
import { useApp } from "@/lib/store";
import { daysUntil } from "@/lib/utils";

export default function ClubDashboardPage() {
  const { clubProfile, opportunities, clubApplicants } = useApp();

  const mine = useMemo(
    () =>
      opportunities
        .filter((o) => o.organizerId === clubProfile.id)
        .sort((a, b) => {
          const aPast = daysUntil(a.date) < 0;
          const bPast = daysUntil(b.date) < 0;
          if (aPast !== bPast) return aPast ? 1 : -1;
          return daysUntil(a.date) - daysUntil(b.date);
        }),
    [opportunities, clubProfile.id],
  );
  const active = mine.filter((o) => daysUntil(o.date) >= 0 && daysUntil(o.deadline) >= 0);
  const newApplicants = clubApplicants.filter((a) => a.status === "new");
  const recent = [...clubApplicants].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)).slice(0, 5);

  const countFor = (id: string) => clubApplicants.filter((a) => a.opportunityId === id);

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            <Building2 className="h-3.5 w-3.5" />
            Club account
          </span>
        }
        title={`Welcome, ${clubProfile.name}`}
        subtitle="Publish opportunities and review the players applying to them."
        action={
          <ButtonLink href="/club/opportunities/new">
            <Plus className="h-4 w-4" />
            Create Opportunity
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard icon={Megaphone} label="Active opportunities" value={active.length} tone="green" />
        <DashboardCard icon={ClipboardList} label="Applications" value={clubApplicants.length} tone="blue" />
        <DashboardCard icon={UserPlus} label="New players" value={newApplicants.length} tone="violet" hint="Waiting for review" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section>
          <SectionTitle
            title="Your Opportunities"
            action={
              <Link
                href="/club/opportunities"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Manage all
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-4 space-y-3">
            {mine.slice(0, 4).map((o) => {
              const list = countFor(o.id);
              return (
                <ClubOpportunityRow
                  key={o.id}
                  opportunity={o}
                  applicantCount={list.length}
                  newCount={list.filter((a) => a.status === "new").length}
                />
              );
            })}
          </div>
        </section>

        <aside>
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Recent applications</p>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {recent.map((a) => {
                const opp = opportunities.find((o) => o.id === a.opportunityId);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {a.name}
                        {a.isCurrentPlayer && <span className="ml-1.5 text-xs text-blue-600">(you, as player)</span>}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {a.age} · {a.position} · {opp?.title ?? "Opportunity"}
                      </p>
                    </div>
                    <ApplicantStatusBadge status={a.status} />
                  </li>
                );
              })}
            </ul>
            <ButtonLink href="/club/applications" variant="secondary" size="sm" fullWidth className="mt-3">
              View Applications
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </div>
  );
}

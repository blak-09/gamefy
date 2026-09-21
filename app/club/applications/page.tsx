"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, MapPin, Star, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { EmptyState } from "@/components/EmptyState";
import { ProfileAvatar } from "@/components/ProfileCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ApplicantStatusBadge, Badge } from "@/components/ui/Badge";
import { useApp } from "@/lib/store";
import { cn, formatDate } from "@/lib/utils";
import type { ApplicantStatus, ClubApplicant } from "@/types";

type StatusTab = "all" | ApplicantStatus;

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "reviewed", label: "Reviewed" },
];

export default function ClubApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <ClubApplications />
    </Suspense>
  );
}

function ClubApplications() {
  const searchParams = useSearchParams();
  const { clubProfile, opportunities, clubApplicants, setApplicantStatus } = useApp();
  const [opportunityId, setOpportunityId] = useState(searchParams.get("opportunity") ?? "all");
  const [tab, setTab] = useState<StatusTab>("all");
  const [viewing, setViewing] = useState<ClubApplicant | null>(null);

  const mine = useMemo(
    () => opportunities.filter((o) => o.organizerId === clubProfile.id),
    [opportunities, clubProfile.id],
  );

  const filtered = useMemo(
    () =>
      clubApplicants
        .filter((a) => opportunityId === "all" || a.opportunityId === opportunityId)
        .filter((a) => tab === "all" || a.status === tab)
        .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)),
    [clubApplicants, opportunityId, tab],
  );

  const countFor = (key: StatusTab) =>
    clubApplicants
      .filter((a) => opportunityId === "all" || a.opportunityId === opportunityId)
      .filter((a) => key === "all" || a.status === key).length;

  const titleOf = (id: string) => opportunities.find((o) => o.id === id)?.title ?? "Opportunity";

  const toggleShortlist = (a: ClubApplicant) =>
    setApplicantStatus(a.id, a.status === "shortlisted" ? "reviewed" : "shortlisted");

  return (
    <div>
      <PageHeader title="Applications" subtitle="Players who have applied to your opportunities." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 sm:inline-flex" role="tablist">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
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
                {countFor(t.key)}
              </span>
            </button>
          ))}
        </div>
        <div className="sm:w-72">
          <Select value={opportunityId} onChange={(e) => setOpportunityId(e.target.value)} aria-label="Filter by opportunity">
            <option value="all">All opportunities</option>
            {mine.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applications here yet"
            description="When players apply to this opportunity, they will show up in this list."
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {filtered.map((a) => (
              <li key={a.id}>
                <Card hover padding="sm" className="flex h-full flex-col sm:p-5">
                  <div className="flex items-start gap-3">
                    <ProfileAvatar name={a.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{a.name}</p>
                        {a.isCurrentPlayer && <Badge tone="blue">Applied via player demo</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">{titleOf(a.opportunityId)}</p>
                    </div>
                    <ApplicantStatusBadge status={a.status} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Age</dt>
                      <dd className="font-medium text-slate-900">{a.age}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Position</dt>
                      <dd className="font-medium text-slate-900">{a.position}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Location</dt>
                      <dd className="font-medium text-slate-900">{a.location}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Level</dt>
                      <dd className="font-medium text-slate-900">{a.level}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-400">Applied {formatDate(a.appliedAt.slice(0, 10), "short")}</p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setViewing(a)}>
                        View Profile
                      </Button>
                      <Button
                        variant={a.status === "shortlisted" ? "success" : "primary"}
                        size="sm"
                        onClick={() => toggleShortlist(a)}
                      >
                        <Star className={cn("h-4 w-4", a.status === "shortlisted" && "fill-current")} />
                        {a.status === "shortlisted" ? "Shortlisted" : "Shortlist"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)}>
        {viewing && (
          <div>
            <div className="flex items-center gap-4">
              <ProfileAvatar name={viewing.name} size="md" />
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">{viewing.name}</h2>
                <p className="text-sm text-slate-500">
                  {viewing.age} | {viewing.position} | {viewing.location}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="blue">{viewing.level}</Badge>
              <ApplicantStatusBadge status={viewing.status} />
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex gap-3">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Goal</dt>
                  <dd className="text-slate-900">{viewing.goal}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Applied to</dt>
                  <dd className="text-slate-900">
                    {titleOf(viewing.opportunityId)} · {formatDate(viewing.appliedAt.slice(0, 10), "short")}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Based in</dt>
                  <dd className="text-slate-900">{viewing.location}</dd>
                </div>
              </div>
            </dl>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setViewing(null)}>
                Close
              </Button>
              <Button
                variant={viewing.status === "shortlisted" ? "success" : "primary"}
                onClick={() => {
                  toggleShortlist(viewing);
                  setViewing({
                    ...viewing,
                    status: viewing.status === "shortlisted" ? "reviewed" : "shortlisted",
                  });
                }}
              >
                <Star className={cn("h-4 w-4", viewing.status === "shortlisted" && "fill-current")} />
                {viewing.status === "shortlisted" ? "Remove from shortlist" : "Shortlist player"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

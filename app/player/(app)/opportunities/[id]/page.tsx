"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Backpack,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ExternalLink,
  Hourglass,
  MapPin,
  Navigation as NavigationIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { MatchPill, MatchReasons, SmartMatchLabel } from "@/components/MatchReasons";
import { EmptyState } from "@/components/EmptyState";
import { useApp } from "@/lib/store";
import { matchOpportunity } from "@/lib/matching";
import { distanceLabel } from "@/lib/geo";
import { cn, deadlineText, formatDate, formatDateRange } from "@/lib/utils";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const { profile, opportunities, getApplication, applyToOpportunity, markViewed } = useApp();
  const opportunity = opportunities.find((o) => o.id === params.id);
  const application = opportunity ? getApplication(opportunity.id) : undefined;

  const [modal, setModal] = useState<"closed" | "confirm" | "success">("closed");

  useEffect(() => {
    if (opportunity) markViewed(opportunity.id);
  }, [opportunity, markViewed]);

  const match = useMemo(
    () => (profile && opportunity ? matchOpportunity(profile, opportunity) : null),
    [profile, opportunity],
  );

  if (!opportunity || !profile) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Opportunity not found"
        description="It may have been removed or the link is incorrect."
        action={
          <ButtonLink href="/player/opportunities" variant="secondary" size="sm">
            Back to opportunities
          </ButtonLink>
        }
      />
    );
  }

  const deadline = deadlineText(opportunity.deadline);
  const distance = match ? distanceLabel(match.distanceKm, match.sameCity) : undefined;
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(opportunity.venue)}`;

  const confirm = () => {
    applyToOpportunity(opportunity.id);
    setModal("success");
  };

  const facts = [
    { icon: CalendarDays, label: "Date", value: formatDateRange(opportunity.date, opportunity.endDate) },
    { icon: Clock, label: "Time", value: opportunity.time },
    { icon: MapPin, label: "Location", value: opportunity.city },
    {
      icon: Users,
      label: "Age eligibility",
      value: `${opportunity.ageLabel} · ${opportunity.ageMin}–${opportunity.ageMax} years`,
    },
    {
      icon: ShieldCheck,
      label: "Position requirements",
      value: opportunity.positions === "any" ? "All positions" : opportunity.positions.join(", "),
    },
    { icon: Hourglass, label: "Registration deadline", value: formatDate(opportunity.deadline) },
  ];

  return (
    <div>
      <Link
        href="/player/opportunities"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        All opportunities
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main content */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={opportunity.type} />
              <Badge tone="neutral">{opportunity.ageLabel}</Badge>
              <Badge tone="neutral">{opportunity.sport}</Badge>
              {opportunity.isDemo ? (
                <Badge tone="neutral">Demo opportunity</Badge>
              ) : (
                <Badge tone="green">Just published</Badge>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {opportunity.title}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Organised by <span className="font-medium text-slate-900">{opportunity.organizer}</span>
            </p>
          </div>

          {/* Mobile apply card position */}
          <div className="lg:hidden">
            <ApplyCard
              applied={Boolean(application)}
              status={application?.status}
              deadline={deadline}
              opportunity={opportunity}
              onApply={() => setModal("confirm")}
            />
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{f.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-slate-900">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[15px] leading-relaxed text-slate-700">{opportunity.description}</p>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <ClipboardCheck className="h-4 w-4 text-blue-600" />
                Entry requirements
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {opportunity.entryRequirements.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Backpack className="h-4 w-4 text-emerald-600" />
                What to bring
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {opportunity.whatToBring.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Location card */}
          <Card padding="none" className="overflow-hidden">
            <div className="relative h-40 bg-[radial-gradient(circle_at_30%_40%,#dbeafe_0,transparent_45%),radial-gradient(circle_at_75%_65%,#d1fae5_0,transparent_45%)] bg-slate-100">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-8 ring-white/70">
                  <MapPin className="h-5 w-5" />
                </span>
              </div>
              <span className="absolute bottom-3 right-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                Map preview
              </span>
            </div>
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{opportunity.venue}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {opportunity.city}
                  {distance && <> · {distance}</>}
                </p>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                <NavigationIcon className="h-4 w-4" />
                Open in Maps
              </a>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block">
            <ApplyCard
              applied={Boolean(application)}
              status={application?.status}
              deadline={deadline}
              opportunity={opportunity}
              onApply={() => setModal("confirm")}
            />
          </div>

          {match && (
            <Card>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Why this opportunity matches you</h2>
                <SmartMatchLabel />
              </div>
              <div className="mt-3">
                <MatchPill match={match} />
              </div>
              <MatchReasons match={match} className="mt-4" compact />
              <p className="mt-4 text-xs text-slate-400">
                Based on your profile: {profile.age} · {profile.position} · {profile.location} · {profile.level}
              </p>
            </Card>
          )}
        </aside>
      </div>

      {/* Apply flow */}
      <Modal open={modal !== "closed"} onClose={() => setModal("closed")}>
        {modal === "confirm" ? (
          <div>
            <h2 className="pr-8 text-2xl font-semibold tracking-tight text-slate-900">Ready to take the next step?</h2>
            <p className="mt-2 text-sm text-slate-500">
              Your profile will be shared with the organiser as your application.
            </p>
            <dl className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Opportunity</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{opportunity.title}</dd>
                <dd className="text-sm text-slate-500">
                  {formatDate(opportunity.date, "short")} · {opportunity.city}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Player</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{profile.name}</dd>
                <dd className="text-sm text-slate-500">
                  {profile.age} · {profile.position} · {profile.location} · {profile.level}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setModal("closed")}>
                Not now
              </Button>
              <Button variant="success" onClick={confirm}>
                Confirm Application
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Application Submitted ✓</h2>
            <p className="mt-2 text-slate-600">Your application has been added to My Opportunities.</p>
            <div className="mt-7 flex flex-col gap-2">
              <ButtonLink href="/player/applications" fullWidth>
                View My Applications
              </ButtonLink>
              <Button variant="ghost" onClick={() => setModal("closed")}>
                Keep exploring
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ApplyCard({
  applied,
  status,
  deadline,
  opportunity,
  onApply,
}: {
  applied: boolean;
  status?: "applied" | "registered" | "upcoming" | "completed";
  deadline: ReturnType<typeof deadlineText>;
  opportunity: { date: string; endDate?: string; registrationMethod: "platform" | "external"; externalUrl?: string };
  onApply: () => void;
}) {
  return (
    <Card className="border-slate-900/10 shadow-md shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Event date</p>
          <p className="mt-0.5 font-semibold text-slate-900">
            {formatDateRange(opportunity.date, opportunity.endDate)}
          </p>
        </div>
        {applied && status && <StatusBadge status={status} />}
      </div>
      <p
        className={cn(
          "mt-3 flex items-center gap-2 text-sm",
          deadline.closed ? "text-slate-500" : deadline.urgent ? "font-medium text-amber-700" : "text-slate-600",
        )}
      >
        <Hourglass className={cn("h-4 w-4", deadline.urgent && !deadline.closed ? "text-amber-500" : "text-slate-400")} />
        {deadline.text}
      </p>

      <div className="mt-5 space-y-2">
        {applied ? (
          <>
            <Button variant="success" fullWidth disabled>
              <CheckCircle2 className="h-4 w-4" />
              Applied
            </Button>
            <ButtonLink href="/player/applications" variant="secondary" fullWidth>
              Track in My Applications
            </ButtonLink>
          </>
        ) : (
          <Button size="lg" fullWidth onClick={onApply} disabled={deadline.closed}>
            {deadline.closed ? "Registration closed" : "Apply Now"}
          </Button>
        )}
        {opportunity.registrationMethod === "external" && opportunity.externalUrl && (
          <a
            href={opportunity.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            Official Registration
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
        )}
      </div>
      {opportunity.registrationMethod === "external" && (
        <p className="mt-3 text-xs text-slate-400">
          This organiser uses its own registration form. Applying here keeps it tracked in your list.
        </p>
      )}
    </Card>
  );
}

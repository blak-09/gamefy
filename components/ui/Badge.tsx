import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ApplicantStatus, ApplicationStatus, OpportunityType } from "@/types";

export type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red" | "violet" | "dark";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  dark: "bg-slate-900 text-white ring-slate-900",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ tone = "neutral", children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const applicationStatusMeta: Record<ApplicationStatus, { label: string; tone: BadgeTone }> = {
  applied: { label: "Applied", tone: "blue" },
  registered: { label: "Registered", tone: "green" },
  upcoming: { label: "Upcoming", tone: "violet" },
  completed: { label: "Completed", tone: "neutral" },
};

const applicantStatusMeta: Record<ApplicantStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "blue" },
  shortlisted: { label: "Shortlisted", tone: "green" },
  reviewed: { label: "Reviewed", tone: "neutral" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = applicationStatusMeta[status];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

export function ApplicantStatusBadge({ status }: { status: ApplicantStatus }) {
  const meta = applicantStatusMeta[status];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

const typeTone: Record<OpportunityType, BadgeTone> = {
  Trial: "blue",
  Tournament: "amber",
  "Selection Camp": "violet",
  Academy: "green",
  "Development Program": "neutral",
};

export function TypeBadge({ type }: { type: OpportunityType }) {
  return <Badge tone={typeTone[type]}>{type}</Badge>;
}

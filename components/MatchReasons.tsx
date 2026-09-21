import { Check, Sparkles, X } from "lucide-react";
import type { MatchResult } from "@/lib/matching";
import { cn } from "@/lib/utils";

export function SmartMatchLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      Smart Match
    </span>
  );
}

export function matchTone(label: MatchResult["label"]) {
  switch (label) {
    case "Strong match":
      return "text-emerald-700 bg-emerald-50 ring-emerald-200";
    case "Good match":
      return "text-blue-700 bg-blue-50 ring-blue-200";
    case "Partial match":
      return "text-amber-800 bg-amber-50 ring-amber-200";
    default:
      return "text-slate-600 bg-slate-100 ring-slate-200";
  }
}

export function MatchPill({ match }: { match: MatchResult }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        matchTone(match.label),
      )}
    >
      <Sparkles className="h-3 w-3" />
      {match.label}
      <span className="font-normal opacity-70">· {match.score}%</span>
    </span>
  );
}

export function MatchReasons({
  match,
  compact = false,
  className,
}: {
  /** Anything with a reasons list - player-side MatchResult or club-side PlayerMatch */
  match: Pick<MatchResult, "reasons">;
  compact?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("space-y-2", compact && "space-y-1.5", className)}>
      {match.reasons.map((reason) => (
        <li key={reason.text} className={cn("flex items-start gap-2.5", compact ? "text-sm" : "text-[15px]")}>
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              reason.ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400",
            )}
          >
            {reason.ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
          </span>
          <span className={reason.ok ? "text-slate-800" : "text-slate-500"}>{reason.text}</span>
        </li>
      ))}
    </ul>
  );
}

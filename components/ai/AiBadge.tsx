import { cn } from "@/lib/utils";
import type { MatchTier } from "@/lib/ai";
import { TIER_LABEL } from "@/lib/ai";

/** Small label used to mark the AI-assisted parts of the club UI. */
export function AiBadge({ label, icon = "✨", className }: { label: string; icon?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-2.5 py-0.5 text-[11px] font-semibold text-white",
        className,
      )}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}

const tierClasses: Record<MatchTier, string> = {
  strong: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  review: "bg-amber-50 text-amber-800 ring-amber-200",
  "no-match": "bg-slate-100 text-slate-600 ring-slate-200",
};

export function ScorePill({ score, tier, className }: { score: number; tier: MatchTier; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tierClasses[tier],
        className,
      )}
      title={TIER_LABEL[tier]}
    >
      {score}% Match
    </span>
  );
}

/** Small note so evaluators know how the feature works in the prototype. */
export function AiNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[11px] leading-relaxed text-slate-400", className)}>{children}</p>;
}

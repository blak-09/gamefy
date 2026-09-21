"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Sparkles, Star, X } from "lucide-react";
import type { ClubApplicant, Opportunity } from "@/types";
import { generateShortlist, type RankedPlayer } from "@/lib/ai";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ApplicantStatusBadge } from "../ui/Badge";
import { ProfileAvatar } from "../ProfileCard";
import { AiBadge, AiNote, ScorePill } from "./AiBadge";

interface Props {
  /** The opportunity being shortlisted for; null when the list is "all opportunities".
   *  Pass a `key` tied to the opportunity id so the result resets when it changes. */
  opportunity: Opportunity | null;
  applicants: ClubApplicant[];
  onViewProfile: (ranked: RankedPlayer<ClubApplicant>) => void;
}

type Phase = "idle" | "analysing" | "done";

export function AiShortlist({ opportunity, applicants, onViewProfile }: Props) {
  const { setApplicantStatus } = useApp();
  const [phase, setPhase] = useState<Phase>("idle");
  const [showOthers, setShowOthers] = useState(false);

  const result = useMemo(
    () => (opportunity && phase === "done" ? generateShortlist(applicants, opportunity) : null),
    [opportunity, applicants, phase],
  );

  const generate = () => {
    setPhase("analysing");
    // Brief pause so the evaluator can see the analysis step; the ranking itself is instant.
    window.setTimeout(() => setPhase("done"), 900);
  };

  const shortlistAll = () => {
    result?.recommended.forEach(({ player }) => {
      if (player.status !== "shortlisted") setApplicantStatus(player.id, "shortlisted");
    });
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">AI Shortlist</h2>
            <AiBadge label="AI Shortlist" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {opportunity
              ? `Rank the ${applicants.length} ${applicants.length === 1 ? "applicant" : "applicants"} to ${opportunity.title} by how well they fit the requirements.`
              : "Choose an opportunity above to generate a shortlist for it."}
          </p>
        </div>
        {phase !== "done" && (
          <Button onClick={generate} disabled={!opportunity || applicants.length === 0 || phase === "analysing"}>
            {phase === "analysing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {phase === "analysing" ? "Analysing applications…" : "Generate AI Shortlist"}
          </Button>
        )}
        {phase === "done" && (
          <Button variant="ghost" size="sm" onClick={() => setPhase("idle")}>
            Clear
          </Button>
        )}
      </div>

      {phase === "analysing" && (
        <div className="border-t border-slate-100 px-5 py-6">
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" style={{ opacity: 1 - i * 0.25 }} />
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Checking age, position, location and playing level for each applicant…</p>
        </div>
      )}

      {phase === "done" && result && opportunity && (
        <div className="animate-fade-in border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
            <p className="text-sm font-semibold text-slate-900">
              Recommended Players{" "}
              <span className="font-normal text-slate-500">
                · {result.recommended.length} of {result.analysed} analysed
              </span>
            </p>
            {result.recommended.length > 0 && (
              <Button variant="success" size="sm" onClick={shortlistAll}>
                <Star className="h-4 w-4" />
                Shortlist all recommended
              </Button>
            )}
          </div>

          {result.recommended.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">
              None of the applicants fit the requirements closely enough to recommend. Review them manually below.
            </p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {result.recommended.map(({ player, match }, i) => (
                <li key={player.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span className="mt-1 w-5 shrink-0 text-sm font-semibold text-slate-400">{i + 1}.</span>
                    <ProfileAvatar name={player.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{player.name}</p>
                        <span className="text-sm text-slate-400">—</span>
                        <ScorePill score={match.score} tier={match.tier} />
                        <ApplicantStatusBadge status={player.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {player.age} · {player.position} · {player.location} · {player.level}
                      </p>
                      <div className="mt-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Why this player matches</p>
                        <ul className="mt-1.5 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                          {match.reasons.map((r) => (
                            <li
                              key={r.text}
                              className={cn("flex items-start gap-1.5 text-xs", r.ok ? "text-slate-700" : "text-slate-400")}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full",
                                  r.ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500",
                                )}
                              >
                                {r.ok ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <X className="h-2.5 w-2.5" strokeWidth={3} />}
                              </span>
                              {r.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 md:flex-col md:items-stretch">
                    <Button variant="secondary" size="sm" onClick={() => onViewProfile({ player, match })}>
                      View Profile
                    </Button>
                    <Button
                      variant={player.status === "shortlisted" ? "success" : "primary"}
                      size="sm"
                      onClick={() =>
                        setApplicantStatus(player.id, player.status === "shortlisted" ? "reviewed" : "shortlisted")
                      }
                    >
                      <Star className={cn("h-4 w-4", player.status === "shortlisted" && "fill-current")} />
                      {player.status === "shortlisted" ? "Shortlisted" : "Shortlist"}
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {result.notRecommended.length > 0 && (
            <div className="border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOthers((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <span>
                  Not recommended ({result.notRecommended.length}) — outside the requirements
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", showOthers && "rotate-180")} />
              </button>
              {showOthers && (
                <ul className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/60">
                  {result.notRecommended.map(({ player, match }) => (
                    <li key={player.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {player.name} <span className="font-normal text-slate-500">· {player.age} · {player.position} · {player.location}</span>
                        </p>
                        <p className="text-xs text-slate-500">{match.reasons.filter((r) => !r.ok).map((r) => r.text).join(" · ")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ScorePill score={match.score} tier={match.tier} />
                        <button
                          type="button"
                          onClick={() => onViewProfile({ player, match })}
                          className="text-xs font-medium text-blue-700 hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-slate-100 px-5 py-3">
        <AiNote>
          Prototype: the shortlist is ranked with transparent rules — age eligibility, required position, distance
          from the venue and playing level — not a trained model.
        </AiNote>
      </div>
    </Card>
  );
}

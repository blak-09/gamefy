"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Users, X } from "lucide-react";
import type { Opportunity } from "@/types";
import { DEMO_PLAYERS, type DemoPlayer } from "@/data/players";
import { useApp } from "@/lib/store";
import { findPlayerMatches, type PlayerLike, type RankedPlayer } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Select } from "../ui/Field";
import { ProfileAvatar } from "../ProfileCard";
import { PlayerProfileModal } from "../PlayerProfileModal";
import { AiBadge, AiNote, ScorePill } from "./AiBadge";

type PoolPlayer = PlayerLike & { id: string; note?: string; isCurrentPlayer?: boolean };

interface AiPlayerMatchesProps {
  /** Opportunities the club can pick from. If only one is passed the selector is hidden. */
  opportunities: Opportunity[];
  defaultOpportunityId?: string;
  initialVisible?: number;
}

export function AiPlayerMatches({ opportunities, defaultOpportunityId, initialVisible = 5 }: AiPlayerMatchesProps) {
  const { profile, clubApplicants } = useApp();
  const [selectedId, setSelectedId] = useState(defaultOpportunityId ?? opportunities[0]?.id ?? "");
  const [showAll, setShowAll] = useState(false);
  const [viewing, setViewing] = useState<RankedPlayer<PoolPlayer> | null>(null);

  const opportunity = opportunities.find((o) => o.id === selectedId) ?? opportunities[0];

  // Talent pool = demo players on the platform + the signed-in demo player (if a profile exists).
  const pool = useMemo<PoolPlayer[]>(() => {
    const demo: PoolPlayer[] = DEMO_PLAYERS.map((p: DemoPlayer) => ({ ...p }));
    if (profile) demo.unshift({ ...profile, id: "current-player", isCurrentPlayer: true });
    return demo;
  }, [profile]);

  const matches = useMemo(() => (opportunity ? findPlayerMatches(pool, opportunity) : []), [pool, opportunity]);
  const appliedNames = useMemo(
    () => new Set(clubApplicants.filter((a) => a.opportunityId === opportunity?.id).map((a) => a.name)),
    [clubApplicants, opportunity?.id],
  );

  if (!opportunity) return null;

  const visible = showAll ? matches : matches.slice(0, initialVisible);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">AI Player Matches</h2>
            <AiBadge label="AI Match" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{matches.length}</span>{" "}
            {matches.length === 1 ? "player matches" : "players match"} this opportunity
          </p>
        </div>
        {opportunities.length > 1 && (
          <div className="sm:w-64">
            <Select value={opportunity.id} onChange={(e) => setSelectedId(e.target.value)} aria-label="Opportunity">
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Users className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-900">No matching players yet</p>
          <p className="mt-1 text-sm text-slate-500">Try widening the age group or location on this opportunity.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map(({ player, match }) => (
            <li key={player.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex min-w-0 flex-1 gap-3">
                <ProfileAvatar name={player.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{player.name}</p>
                    <ScorePill score={match.score} tier={match.tier} />
                    {player.isCurrentPlayer && <Badge tone="blue">Demo player account</Badge>}
                    {appliedNames.has(player.name) && (
                      <Badge tone="green" dot>
                        Applied
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {player.age} · {player.position} · {player.location} · {player.level}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {match.reasons.map((r) => (
                      <li
                        key={r.text}
                        className={cn("inline-flex items-center gap-1 text-xs", r.ok ? "text-emerald-700" : "text-slate-400")}
                      >
                        {r.ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
                        {shortReason(r.text)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setViewing({ player, match })} className="self-start sm:self-center">
                View Profile
              </Button>
            </li>
          ))}
        </ul>
      )}

      {matches.length > initialVisible && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-sm font-medium text-blue-700 hover:bg-slate-50"
        >
          {showAll ? "Show fewer" : `Show all ${matches.length} matches`}
          <ChevronDown className={cn("h-4 w-4 transition-transform", showAll && "rotate-180")} />
        </button>
      )}

      <div className="border-t border-slate-100 px-5 py-3">
        <AiNote>
          Prototype: matches are ranked with transparent rules (age 40 · position 25 · location 20 · level 15) across
          demo players registered on the platform.
        </AiNote>
      </div>

      <PlayerProfileModal
        player={viewing?.player ?? null}
        match={viewing?.match}
        onClose={() => setViewing(null)}
        details={
          viewing?.player.note ? (
            <div className="flex gap-3">
              <span className="mt-0.5 h-4 w-4 shrink-0 text-center text-xs text-slate-400">✎</span>
              <div>
                <dt className="text-xs text-slate-500">Scout note (sample)</dt>
                <dd className="text-slate-900">{viewing.player.note}</dd>
              </div>
            </div>
          ) : undefined
        }
        footer={
          <Button variant="ghost" onClick={() => setViewing(null)}>
            Close
          </Button>
        }
      />
    </Card>
  );
}

/** Trim the scorer's explanation into the short chip style used in the list. */
function shortReason(text: string): string {
  return text
    .replace(/^Age eligible.*$/, "Age eligible")
    .replace(/ \(all positions welcome\)$/, "")
    .replace(/ — required position$/, "")
    .replace(/^Nearby — .*$/, "Nearby")
    .replace(/ level \(all levels welcome\)$/, " level")
    .replace(/ level$/, " level");
}

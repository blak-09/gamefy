"use client";

import type { ReactNode } from "react";
import { MapPin, Target } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { ProfileAvatar } from "./ProfileCard";
import { MatchReasons } from "./MatchReasons";
import { ScorePill } from "./ai/AiBadge";
import type { PlayerLike, PlayerMatch } from "@/lib/ai";

interface PlayerProfileModalProps {
  player: PlayerLike | null;
  onClose: () => void;
  /** Optional match result to show a score and reasons */
  match?: PlayerMatch;
  matchLabel?: string;
  /** Extra rows rendered under the profile (e.g. applied-to) */
  details?: ReactNode;
  badges?: ReactNode;
  footer?: ReactNode;
}

export function PlayerProfileModal({ player, onClose, match, matchLabel, details, badges, footer }: PlayerProfileModalProps) {
  return (
    <Modal open={Boolean(player)} onClose={onClose}>
      {player && (
        <div>
          <div className="flex items-center gap-4">
            <ProfileAvatar name={player.name} size="md" />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">{player.name}</h2>
              <p className="text-sm text-slate-500">
                {player.age} | {player.position} | {player.location}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone="blue">{player.level}</Badge>
            {badges}
            {match && <ScorePill score={match.score} tier={match.tier} />}
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            {player.goal && (
              <div className="flex gap-3">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Goal</dt>
                  <dd className="text-slate-900">{player.goal}</dd>
                </div>
              </div>
            )}
            {details}
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <dt className="text-xs text-slate-500">Based in</dt>
                <dd className="text-slate-900">{player.location}</dd>
              </div>
            </div>
          </dl>

          {match && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {matchLabel ?? "Why this player matches"}
              </p>
              <MatchReasons match={match} compact className="mt-2.5" />
            </div>
          )}

          {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
        </div>
      )}
    </Modal>
  );
}

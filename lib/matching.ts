import type { Opportunity, PlayerProfile } from "@/types";
import { distanceBetween } from "./geo";
import { daysUntil } from "./utils";

export interface MatchReason {
  ok: boolean;
  text: string;
}

export type MatchLabel = "Strong match" | "Good match" | "Partial match" | "Low match";

export interface MatchResult {
  score: number;
  label: MatchLabel;
  reasons: MatchReason[];
  eligibleAge: boolean;
  registrationOpen: boolean;
  distanceKm?: number;
  sameCity: boolean;
}

/**
 * Rule-based matching. Intentionally simple and transparent:
 * age, position, location, playing level and whether registration is open.
 * This is the foundation a smarter recommendation layer can be built on later.
 */
export function matchOpportunity(profile: PlayerProfile, opp: Opportunity): MatchResult {
  const reasons: MatchReason[] = [];
  let score = 0;

  // Age (35 points)
  const eligibleAge = profile.age >= opp.ageMin && profile.age <= opp.ageMax;
  if (eligibleAge) {
    score += 35;
    reasons.push({ ok: true, text: `You are in the eligible age group (${opp.ageLabel})` });
  } else {
    reasons.push({
      ok: false,
      text: `Age group is ${opp.ageLabel} (${opp.ageMin}–${opp.ageMax}) — you are ${profile.age}`,
    });
  }

  // Position (20 points)
  if (opp.positions === "any") {
    score += 20;
    reasons.push({ ok: true, text: "Open to all positions" });
  } else if (opp.positions.includes(profile.position)) {
    score += 20;
    reasons.push({ ok: true, text: `Position: ${profile.position}` });
  } else {
    reasons.push({
      ok: false,
      text: `Looking for ${opp.positions.join(", ")} — you play ${profile.position}`,
    });
  }

  // Location (20 points)
  const sameCity = profile.location === opp.city;
  const distanceKm = distanceBetween(profile.location, opp.city);
  if (sameCity) {
    score += 20;
    reasons.push({ ok: true, text: `In your city — ${opp.city}` });
  } else if (distanceKm !== undefined && distanceKm <= 40) {
    score += 15;
    reasons.push({ ok: true, text: `Near your location (${distanceKm} km away)` });
  } else if (distanceKm !== undefined && distanceKm <= 120) {
    score += 8;
    reasons.push({ ok: true, text: `Within travel distance (${distanceKm} km away)` });
  } else if (distanceKm !== undefined) {
    reasons.push({ ok: false, text: `Far from you (${distanceKm} km away)` });
  } else {
    score += 8;
    reasons.push({ ok: true, text: `Held in ${opp.city}` });
  }

  // Playing level (15 points)
  if (opp.levels === "all") {
    score += 15;
    reasons.push({ ok: true, text: "Open to all playing levels" });
  } else if (opp.levels.includes(profile.level)) {
    score += 15;
    reasons.push({ ok: true, text: `Open to ${profile.level} players` });
  } else {
    reasons.push({
      ok: false,
      text: `Aimed at ${opp.levels.join(" / ")} players — you are ${profile.level}`,
    });
  }

  // Registration window (10 points)
  const registrationOpen = daysUntil(opp.deadline) >= 0;
  if (registrationOpen) {
    score += 10;
    reasons.push({ ok: true, text: "Registration is still open" });
  } else {
    reasons.push({ ok: false, text: "Registration has closed" });
  }

  let label: MatchLabel = "Low match";
  if (score >= 85) label = "Strong match";
  else if (score >= 65) label = "Good match";
  else if (score >= 40) label = "Partial match";

  return { score, label, reasons, eligibleAge, registrationOpen, distanceKm, sameCity };
}

export function rankOpportunities(profile: PlayerProfile, opportunities: Opportunity[]) {
  return opportunities
    .map((opportunity) => ({ opportunity, match: matchOpportunity(profile, opportunity) }))
    .sort((a, b) => {
      if (b.match.score !== a.match.score) return b.match.score - a.match.score;
      return daysUntil(a.opportunity.deadline) - daysUntil(b.opportunity.deadline);
    });
}

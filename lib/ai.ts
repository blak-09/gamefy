/**
 * AI features for the club side of the prototype.
 *
 * Everything in this file is deterministic, rule-based logic that runs in the
 * browser. It is designed to behave like the intended AI workflow (matching,
 * shortlisting, summarising, drafting) without any external model or API.
 * The UI labels it as "AI Match" / "AI Shortlist" but never claims a trained
 * model is running.
 */
import type { ClubApplicant, Opportunity, OpportunityType, PlayingLevel, Position } from "@/types";
import { AGE_GROUPS } from "@/types";
import { CITIES, distanceBetween } from "./geo";
import { daysUntil, toISODate } from "./utils";
import type { MatchReason } from "./matching";

/** The minimum shape the scorer needs - satisfied by ClubApplicant, DemoPlayer and PlayerProfile. */
export interface PlayerLike {
  name: string;
  age: number;
  position: Position;
  location: string;
  level: PlayingLevel;
  goal?: string;
}

export type MatchTier = "strong" | "review" | "no-match";

export interface PlayerMatch {
  score: number;
  tier: MatchTier;
  reasons: MatchReason[];
  distanceKm?: number;
}

export const TIER_LABEL: Record<MatchTier, string> = {
  strong: "Strong match",
  review: "Needs review",
  "no-match": "Not a match",
};

const LEVEL_INDEX: Record<PlayingLevel, number> = { Beginner: 0, Grassroots: 1, Intermediate: 2, Advanced: 3 };

/**
 * Score a player against an opportunity from the club's point of view.
 * Age 40 · Position 25 · Location 20 · Level 15 = 100.
 */
export function scorePlayer(player: PlayerLike, opp: Opportunity): PlayerMatch {
  const reasons: MatchReason[] = [];
  let score = 0;

  // Age
  if (player.age >= opp.ageMin && player.age <= opp.ageMax) {
    score += 40;
    reasons.push({ ok: true, text: `Age eligible (${player.age}, ${opp.ageLabel})` });
  } else if (player.age === opp.ageMin - 1 || player.age === opp.ageMax + 1) {
    score += 15;
    reasons.push({ ok: false, text: `Just outside age group (${player.age}, needs ${opp.ageMin}–${opp.ageMax})` });
  } else {
    reasons.push({ ok: false, text: `Outside age group (${player.age}, needs ${opp.ageMin}–${opp.ageMax})` });
  }

  // Position
  if (opp.positions === "any") {
    score += 22;
    reasons.push({ ok: true, text: `${player.position} (all positions welcome)` });
  } else if (opp.positions.includes(player.position)) {
    score += 25;
    reasons.push({ ok: true, text: `${player.position} — required position` });
  } else {
    reasons.push({ ok: false, text: `${player.position} — looking for ${opp.positions.join(" / ")}` });
  }

  // Location
  const distanceKm = distanceBetween(player.location, opp.city);
  if (player.location === opp.city) {
    score += 20;
    reasons.push({ ok: true, text: `Nearby — in ${opp.city}` });
  } else if (distanceKm !== undefined && distanceKm <= 25) {
    score += 16;
    reasons.push({ ok: true, text: `Nearby — ${distanceKm} km from ${opp.city}` });
  } else if (distanceKm !== undefined && distanceKm <= 60) {
    score += 9;
    reasons.push({ ok: true, text: `${distanceKm} km from ${opp.city}` });
  } else if (distanceKm !== undefined) {
    reasons.push({ ok: false, text: `Far away — ${distanceKm} km from ${opp.city}` });
  } else {
    score += 6;
    reasons.push({ ok: false, text: `Based in ${player.location}` });
  }

  // Playing level
  if (opp.levels === "all") {
    score += 15;
    reasons.push({ ok: true, text: `${player.level} level (all levels welcome)` });
  } else if (opp.levels.includes(player.level)) {
    score += 15;
    reasons.push({ ok: true, text: `${player.level} level` });
  } else {
    const wanted = opp.levels.map((l) => LEVEL_INDEX[l]);
    const gap = Math.min(...wanted.map((w) => Math.abs(w - LEVEL_INDEX[player.level])));
    if (gap === 1) {
      score += 7;
      reasons.push({ ok: false, text: `${player.level} level — close to ${opp.levels.join(" / ")}` });
    } else {
      reasons.push({ ok: false, text: `${player.level} level — needs ${opp.levels.join(" / ")}` });
    }
  }

  const tier: MatchTier = score >= 80 ? "strong" : score >= 50 ? "review" : "no-match";
  return { score, tier, reasons, distanceKm };
}

export interface RankedPlayer<T extends PlayerLike> {
  player: T;
  match: PlayerMatch;
}

export function rankPlayers<T extends PlayerLike>(players: T[], opp: Opportunity): RankedPlayer<T>[] {
  return players
    .map((player) => ({ player, match: scorePlayer(player, opp) }))
    .sort((a, b) => b.match.score - a.match.score || a.player.name.localeCompare(b.player.name));
}

/** Players from a pool worth showing as "AI matches" for an opportunity. */
export function findPlayerMatches<T extends PlayerLike>(pool: T[], opp: Opportunity, minScore = 60) {
  return rankPlayers(pool, opp).filter((r) => r.match.score >= minScore);
}

/** Applicants recommended for a shortlist: strong first, then review-tier, capped. */
export function generateShortlist(applicants: ClubApplicant[], opp: Opportunity, limit = 5) {
  const ranked = rankPlayers(applicants, opp);
  const recommended = ranked.filter((r) => r.match.tier !== "no-match").slice(0, limit);
  const notRecommended = ranked.filter((r) => !recommended.includes(r));
  return { recommended, notRecommended, analysed: ranked.length };
}

export interface ApplicationSummary {
  total: number;
  strong: number;
  review: number;
  noMatch: number;
  insight: string;
}

function topN<T>(counts: Map<T, number>, n: number): T[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

/**
 * Summarise a set of applicants. Each applicant is scored against the
 * opportunity they applied to, so mixed lists (all opportunities) still work.
 */
export function summarizeApplications(
  applicants: ClubApplicant[],
  opportunities: Opportunity[],
  focus?: Opportunity,
): ApplicationSummary {
  const scored = applicants
    .map((a) => {
      const opp = opportunities.find((o) => o.id === a.opportunityId);
      return opp ? { applicant: a, opp, match: scorePlayer(a, opp) } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const strongList = scored.filter((s) => s.match.tier === "strong");
  const summary: ApplicationSummary = {
    total: scored.length,
    strong: strongList.length,
    review: scored.filter((s) => s.match.tier === "review").length,
    noMatch: scored.filter((s) => s.match.tier === "no-match").length,
    insight: "",
  };

  if (scored.length === 0) {
    summary.insight = "No applications yet. Once players apply, this summary will show who fits the requirements.";
    return summary;
  }
  if (strongList.length === 0) {
    summary.insight =
      "None of the current applicants fully meet the requirements. Consider widening the age group or location, or reviewing the closest matches manually.";
    return summary;
  }

  const ages = strongList.map((s) => s.applicant.age);
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  const distances = strongList.map((s) => s.match.distanceKm ?? 0);
  const within25 = distances.filter((d) => d <= 25).length;
  const maxDistance = Math.max(...distances);
  const positions = new Map<Position, number>();
  for (const s of strongList) positions.set(s.applicant.position, (positions.get(s.applicant.position) ?? 0) + 1);
  const [p1, p2] = topN(positions, 2);

  const where = focus ? "the trial location" : "your opportunities";
  const ageText = minAge === maxAge ? `aged ${minAge}` : `aged ${minAge}–${maxAge}`;
  const distanceText =
    within25 === strongList.length
      ? `live within ${Math.max(maxDistance, 5)} km of ${where}`
      : `${within25} of ${strongList.length} live within 25 km of ${where}`;
  const positionText = p2
    ? `${p1} and ${p2.toLowerCase()} positions have the most suitable applicants.`
    : `${p1}s make up most of the suitable applicants.`;

  summary.insight = `Most strong matches are ${ageText} and ${distanceText}. ${positionText}`;
  return summary;
}

export interface Insight {
  text: string;
  tone: "positive" | "neutral" | "warning";
}

/** Short, data-derived insights for the club dashboard. */
export function dashboardInsights(
  opportunities: Opportunity[],
  applicants: ClubApplicant[],
  pool: PlayerLike[],
): Insight[] {
  const insights: Insight[] = [];
  const active = opportunities.filter((o) => daysUntil(o.date) >= 0 && daysUntil(o.deadline) >= 0);
  if (active.length === 0) {
    return [{ text: "No active opportunities right now. Publish one to start receiving matched applications.", tone: "neutral" }];
  }

  // Which active opportunity has the most applicants?
  const withCounts = active
    .map((o) => ({ o, list: applicants.filter((a) => a.opportunityId === o.id) }))
    .sort((a, b) => b.list.length - a.list.length);
  const lead = withCounts[0];

  if (lead.list.length > 0) {
    const local = lead.list.filter((a) => (distanceBetween(a.location, lead.o.city) ?? 999) <= 25).length;
    const strong = lead.list.filter((a) => scorePlayer(a, lead.o).tier === "strong").length;
    if (local / lead.list.length >= 0.5) {
      insights.push({
        text: `Your ${lead.o.title} is receiving strong interest from local players — ${local} of ${lead.list.length} applicants are within 25 km of ${lead.o.city}.`,
        tone: "positive",
      });
    } else {
      insights.push({
        text: `${strong} of ${lead.list.length} applicants to ${lead.o.title} fit the requirements. Most are travelling from outside ${lead.o.city}.`,
        tone: "neutral",
      });
    }
  }

  // Untapped matches in the talent pool
  const applicantNames = new Set(applicants.map((a) => a.name));
  for (const { o } of withCounts) {
    const matches = findPlayerMatches(pool, o, 80).filter((r) => !applicantNames.has(r.player.name));
    if (matches.length >= 2) {
      insights.push({
        text: `${matches.length} players on the platform match ${o.title} but haven't applied yet — worth inviting before the deadline.`,
        tone: "neutral",
      });
      break;
    }
  }

  // Deadline pressure + review backlog
  const soonest = [...active].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))[0];
  const pending = applicants.filter((a) => a.opportunityId === soonest.id && a.status === "new").length;
  const days = daysUntil(soonest.deadline);
  if (days <= 7) {
    insights.push({
      text: `Registration for ${soonest.title} closes in ${days} ${days === 1 ? "day" : "days"}${
        pending ? ` and ${pending} new ${pending === 1 ? "application is" : "applications are"} still waiting for review` : ""
      }.`,
      tone: pending ? "warning" : "neutral",
    });
  }

  return insights.slice(0, 3);
}

/* ------------------------------------------------------------------ */
/* Natural-language opportunity drafting                               */
/* ------------------------------------------------------------------ */

export interface OpportunityDraft {
  title: string;
  type: OpportunityType;
  ageGroup: string;
  position: Position | "any";
  city: string;
  venue: string;
  date: string;
  deadline: string;
  time: string;
  level: PlayingLevel | "all";
  description: string;
  requirements: string[];
  registrationNote: string;
  /** What the parser understood from the prompt - shown to the user for transparency. */
  understood: { label: string; value: string }[];
  missing: string[];
}

const TYPE_KEYWORDS: [RegExp, OpportunityType][] = [
  [/selection\s*camp|selection\s*day|camp/i, "Selection Camp"],
  [/tournament|cup|league|championship/i, "Tournament"],
  [/academy|scholarship/i, "Academy"],
  [/development|programme|program|training/i, "Development Program"],
  [/trial|tryout|try-out|scouting/i, "Trial"],
];

const POSITION_KEYWORDS: [RegExp, Position][] = [
  [/goal\s*keeper|keeper|\bgk\b/i, "Goalkeeper"],
  [/defender|defence|defense|centre[- ]back|center[- ]back|full[- ]back|\bcb\b/i, "Defender"],
  [/midfield|\bcm\b|\bcdm\b|\bcam\b/i, "Midfielder"],
  [/winger|wing|\blw\b|\brw\b/i, "Winger"],
  [/striker|forward|attacker|\bst\b|\bcf\b/i, "Striker"],
];

const LEVEL_KEYWORDS: [RegExp, PlayingLevel][] = [
  [/beginner|first[- ]time|no experience/i, "Beginner"],
  [/grassroots|community/i, "Grassroots"],
  [/intermediate|club[- ]level|experienced/i, "Intermediate"],
  [/advanced|elite|competitive|state[- ]level/i, "Advanced"],
];

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function nextWeekday(from: Date, weekday: number, weeksAhead = 0): Date {
  const d = new Date(from);
  const diff = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff + weeksAhead * 7);
  return d;
}

function parseDate(text: string, today: Date): { date: Date; phrase: string } | null {
  const t = text.toLowerCase();

  const explicit = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/);
  const explicitAlt = t.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/);
  if (explicit || explicitAlt) {
    const day = Number(explicit ? explicit[1] : explicitAlt![2]);
    const month = MONTHS.indexOf(explicit ? explicit[2] : explicitAlt![1]);
    let d = new Date(today.getFullYear(), month, day);
    if (d < today) d = new Date(today.getFullYear() + 1, month, day);
    return { date: d, phrase: `${day} ${MONTHS[month]}` };
  }

  if (/next\s+weekend/.test(t)) return { date: nextWeekday(today, 6, 1), phrase: "next weekend" };
  if (/this\s+weekend|weekend/.test(t)) return { date: nextWeekday(today, 6), phrase: "this weekend" };
  if (/tomorrow/.test(t)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return { date: d, phrase: "tomorrow" };
  }
  const inDays = t.match(/in\s+(\d+)\s+days?/);
  if (inDays) {
    const d = new Date(today);
    d.setDate(d.getDate() + Number(inDays[1]));
    return { date: d, phrase: `in ${inDays[1]} days` };
  }
  const inWeeks = t.match(/in\s+(\d+|a|two|three)\s+weeks?/);
  if (inWeeks) {
    const n = inWeeks[1] === "a" ? 1 : inWeeks[1] === "two" ? 2 : inWeeks[1] === "three" ? 3 : Number(inWeeks[1]);
    const d = new Date(today);
    d.setDate(d.getDate() + n * 7);
    return { date: d, phrase: `in ${n} ${n === 1 ? "week" : "weeks"}` };
  }
  if (/next\s+week/.test(t)) return { date: nextWeekday(today, 6), phrase: "next week" };
  if (/next\s+month/.test(t)) {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { date: nextWeekday(d, 6), phrase: "next month" };
  }
  const weekday = t.match(/(?:next\s+|this\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
  if (weekday) {
    const idx = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(weekday[1]);
    return { date: nextWeekday(today, idx, /next\s+/.test(weekday[0]) ? 1 : 0), phrase: weekday[0].trim() };
  }
  return null;
}

/**
 * Turn a short request like "Create an U-17 striker trial in Faridabad next weekend"
 * into a complete, editable opportunity draft.
 */
export function draftOpportunityFromPrompt(prompt: string, clubName: string, clubCity: string): OpportunityDraft {
  const text = prompt.trim();
  const today = new Date();
  const understood: OpportunityDraft["understood"] = [];
  const missing: string[] = [];

  // Type
  let type: OpportunityType = "Trial";
  const typeHit = TYPE_KEYWORDS.find(([re]) => re.test(text));
  if (typeHit) {
    type = typeHit[1];
    understood.push({ label: "Type", value: type });
  } else {
    missing.push("type (defaulted to Trial)");
  }

  // Age group
  let ageGroup = "U-17";
  const ageHit = text.match(/u[- ]?(\d{2})|under[- ](\d{2})/i);
  if (ageHit) {
    const n = Number(ageHit[1] ?? ageHit[2]);
    const nearest = AGE_GROUPS.reduce((best, g) => {
      const gNum = Number(g.label.replace("U-", "")) || 99;
      const bNum = Number(best.label.replace("U-", "")) || 99;
      return Math.abs(gNum - n) < Math.abs(bNum - n) ? g : best;
    });
    ageGroup = nearest.label;
    understood.push({ label: "Age group", value: `${ageGroup} (${nearest.min}–${nearest.max})` });
  } else if (/senior|open age|adult|men'?s|women'?s/i.test(text)) {
    ageGroup = "Open";
    understood.push({ label: "Age group", value: "Open" });
  } else {
    missing.push("age group (defaulted to U-17)");
  }
  const group = AGE_GROUPS.find((g) => g.label === ageGroup)!;

  // Position
  let position: Position | "any" = "any";
  const posHit = POSITION_KEYWORDS.find(([re]) => re.test(text));
  if (posHit) {
    position = posHit[1];
    understood.push({ label: "Position", value: position });
  } else {
    understood.push({ label: "Position", value: "Any position" });
  }

  // City
  let city = clubCity;
  const cityHit = CITIES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(text));
  if (cityHit) {
    city = cityHit;
    understood.push({ label: "Location", value: city });
  } else {
    missing.push(`location (using club city, ${clubCity})`);
  }

  // Date
  const parsed = parseDate(text, today);
  let date: Date;
  if (parsed) {
    date = parsed.date;
    understood.push({ label: "Date", value: `${parsed.phrase} → ${toISODate(date)}` });
  } else {
    date = nextWeekday(today, 6, 2);
    missing.push("date (suggested a Saturday in two weeks)");
  }
  const deadline = new Date(date);
  deadline.setDate(deadline.getDate() - Math.max(3, Math.min(7, Math.floor(daysUntil(toISODate(date)) / 2))));
  if (deadline <= today) deadline.setTime(today.getTime() + 86400000);

  // Level
  let level: PlayingLevel | "all" = "all";
  const levelHit = LEVEL_KEYWORDS.find(([re]) => re.test(text));
  if (levelHit) {
    level = levelHit[1];
    understood.push({ label: "Level", value: level });
  }

  // Compose text
  const posLabel = position === "any" ? "" : `${position} `;
  const title = `${ageGroup === "Open" ? "Open" : ageGroup} ${posLabel}${type === "Selection Camp" ? "Selection Camp" : type === "Development Program" ? "Development Programme" : type === "Academy" ? "Academy Trial" : type}`;

  const positionSentence =
    position === "any"
      ? "Players in all positions are welcome."
      : `We are specifically looking for ${position.toLowerCase()}s to strengthen the squad.`;
  const levelSentence =
    level === "all"
      ? "Open to all playing levels."
      : `Best suited to ${level.toLowerCase()} players${level === "Beginner" ? " — no prior club experience needed" : ""}.`;
  const typeSentence: Record<OpportunityType, string> = {
    Trial: `${clubName} is holding an open ${ageGroup} trial in ${city}. The session includes a warm-up, position-specific drills, small-sided games and a full match observed by our coaching staff. Shortlisted players will be contacted for a second session.`,
    Tournament: `${clubName} is hosting a ${ageGroup} tournament in ${city}. Teams and individual players can register; solo players will be placed in pooled squads on the day.`,
    "Selection Camp": `${clubName} is running a one-day ${ageGroup} selection camp in ${city} to pick players for the upcoming season's squad. Players are assessed on fitness, technique and match play.`,
    Academy: `${clubName} is opening academy places for ${ageGroup} players in ${city}. Selected players train with certified coaches through the season.`,
    "Development Program": `${clubName} is launching a ${ageGroup} development programme in ${city} — structured weekly sessions focused on technique, fitness and game understanding.`,
  };
  const description = `${typeSentence[type]} ${positionSentence} ${levelSentence}`;

  const requirements = [
    `Age ${group.min}–${group.max} on the day of the event`,
    "Age proof (school ID, Aadhaar or birth certificate)",
    ...(group.max < 18 ? ["Parent or guardian consent for players under 18"] : []),
    ...(position !== "any" ? [`Currently playing as a ${position.toLowerCase()}`] : []),
  ];

  return {
    title,
    type,
    ageGroup,
    position,
    city,
    venue: `${clubName} Training Ground, ${city}`,
    date: toISODate(date),
    deadline: toISODate(deadline),
    time: type === "Tournament" ? "8:00 AM onwards" : "7:00 AM – 10:30 AM",
    level,
    description,
    requirements,
    registrationNote: "Players apply with their profile on the platform. You review and shortlist them in Applications.",
    understood,
    missing,
  };
}

export type Role = "player" | "club";

export type Position =
  | "Goalkeeper"
  | "Defender"
  | "Midfielder"
  | "Winger"
  | "Striker";

export type PlayingLevel = "Beginner" | "Grassroots" | "Intermediate" | "Advanced";

export type OpportunityType =
  | "Trial"
  | "Tournament"
  | "Selection Camp"
  | "Academy"
  | "Development Program";

export type RegistrationMethod = "platform" | "external";

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  sport: "Football";
  organizer: string;
  organizerId: string;
  city: string;
  venue: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  endDate?: string;
  time: string;
  /** ISO date, yyyy-mm-dd */
  deadline: string;
  ageLabel: string;
  ageMin: number;
  ageMax: number;
  positions: Position[] | "any";
  levels: PlayingLevel[] | "all";
  description: string;
  entryRequirements: string[];
  whatToBring: string[];
  registrationMethod: RegistrationMethod;
  externalUrl?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface PlayerProfile {
  name: string;
  age: number;
  location: string;
  position: Position;
  level: PlayingLevel;
  goal: string;
}

export type ApplicationStatus = "applied" | "registered" | "upcoming" | "completed";

export interface Application {
  id: string;
  opportunityId: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export type ApplicantStatus = "new" | "shortlisted" | "reviewed";

export interface ClubApplicant {
  id: string;
  opportunityId: string;
  name: string;
  age: number;
  position: Position;
  location: string;
  level: PlayingLevel;
  goal: string;
  status: ApplicantStatus;
  appliedAt: string;
  /** True when this applicant is the currently signed-in demo player */
  isCurrentPlayer?: boolean;
}

export interface ClubProfile {
  id: string;
  name: string;
  location: string;
  founded: string;
  description: string;
  contactEmail: string;
}

export const POSITIONS: Position[] = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Winger",
  "Striker",
];

export const LEVELS: PlayingLevel[] = [
  "Beginner",
  "Grassroots",
  "Intermediate",
  "Advanced",
];

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  "Trial",
  "Tournament",
  "Selection Camp",
  "Academy",
  "Development Program",
];

export const AGE_GROUPS: { label: string; min: number; max: number }[] = [
  { label: "U-14", min: 11, max: 14 },
  { label: "U-16", min: 13, max: 16 },
  { label: "U-17", min: 14, max: 17 },
  { label: "U-19", min: 16, max: 19 },
  { label: "Open", min: 16, max: 35 },
];

export const PLAYER_GOALS = [
  "Find trials and tournaments",
  "Join a football academy",
  "Get selected for a district or state team",
  "Play more competitive matches",
];

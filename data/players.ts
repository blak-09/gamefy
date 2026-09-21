import type { PlayingLevel, Position } from "@/types";

/**
 * Demo players registered on the platform. Used by the club-side AI Match
 * feature to surface suitable players who haven't necessarily applied yet.
 * All names are fictional sample data.
 */
export interface DemoPlayer {
  id: string;
  name: string;
  age: number;
  position: Position;
  location: string;
  level: PlayingLevel;
  goal: string;
  /** Short note a scout might have added - purely illustrative. */
  note: string;
}

export const DEMO_PLAYERS: DemoPlayer[] = [
  { id: "pl-1", name: "Rahul Sharma", age: 16, position: "Striker", location: "Faridabad", level: "Grassroots", goal: "Find trials and tournaments", note: "Top scorer in a local school league last season." },
  { id: "pl-2", name: "Aman Verma", age: 17, position: "Striker", location: "Delhi", level: "Intermediate", goal: "Join a football academy", note: "Two seasons with a Delhi district side." },
  { id: "pl-3", name: "Vikram Singh", age: 15, position: "Midfielder", location: "Faridabad", level: "Grassroots", goal: "Play more competitive matches", note: "Comfortable on both feet, good engine." },
  { id: "pl-4", name: "Priya Nair", age: 16, position: "Winger", location: "Gurugram", level: "Grassroots", goal: "Get selected for a district or state team", note: "Quick on the left wing, plays for a girls' community team." },
  { id: "pl-5", name: "Mohit Rawat", age: 17, position: "Defender", location: "Noida", level: "Intermediate", goal: "Join a football academy", note: "Centre-back, strong in the air." },
  { id: "pl-6", name: "Sahil Ansari", age: 14, position: "Goalkeeper", location: "Faridabad", level: "Beginner", goal: "Find trials and tournaments", note: "New to organised football, keen to learn." },
  { id: "pl-7", name: "Karan Mehta", age: 18, position: "Striker", location: "Ghaziabad", level: "Advanced", goal: "Get selected for a district or state team", note: "Played at state under-19 level." },
  { id: "pl-8", name: "Tanvi Bisht", age: 15, position: "Midfielder", location: "Faridabad", level: "Grassroots", goal: "Find trials and tournaments", note: "Creative midfielder, good set-piece delivery." },
  { id: "pl-9", name: "Farhan Qureshi", age: 16, position: "Winger", location: "Delhi", level: "Intermediate", goal: "Join a football academy", note: "Direct, pacey winger." },
  { id: "pl-10", name: "Aryan Kapoor", age: 19, position: "Striker", location: "Jaipur", level: "Intermediate", goal: "Play more competitive matches", note: "Looking to move to the NCR for football." },
  { id: "pl-11", name: "Deepak Yadav", age: 16, position: "Defender", location: "Sonipat", level: "Grassroots", goal: "Find trials and tournaments", note: "Full-back, disciplined positioning." },
  { id: "pl-12", name: "Rohit Pillai", age: 20, position: "Midfielder", location: "Mumbai", level: "Advanced", goal: "Play more competitive matches", note: "University-level player." },
];

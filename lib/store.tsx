"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ApplicantStatus,
  Application,
  ClubApplicant,
  ClubProfile,
  Opportunity,
  PlayerProfile,
} from "@/types";
import { DEMO_OPPORTUNITIES } from "@/data/opportunities";
import {
  DEMO_APPLICATIONS,
  DEMO_CLUB_APPLICANTS,
  DEMO_CLUB_PROFILE,
  DEMO_VIEWED_IDS,
} from "@/data/demo";
import { uid } from "./utils";

const STORAGE_KEY = "gaon.state";
const STORAGE_VERSION = 2;

interface AppState {
  version: number;
  profile: PlayerProfile | null;
  opportunities: Opportunity[];
  applications: Application[];
  viewedIds: string[];
  clubApplicants: ClubApplicant[];
  clubProfile: ClubProfile;
}

function initialState(): AppState {
  return {
    version: STORAGE_VERSION,
    profile: null,
    opportunities: DEMO_OPPORTUNITIES,
    applications: DEMO_APPLICATIONS,
    viewedIds: DEMO_VIEWED_IDS,
    clubApplicants: DEMO_CLUB_APPLICANTS,
    clubProfile: DEMO_CLUB_PROFILE,
  };
}

export type NewOpportunityInput = Omit<
  Opportunity,
  "id" | "sport" | "organizer" | "organizerId" | "isDemo" | "createdAt"
>;

interface AppContextValue extends AppState {
  hydrated: boolean;
  setProfile: (profile: PlayerProfile) => void;
  updateProfile: (patch: Partial<PlayerProfile>) => void;
  markViewed: (opportunityId: string) => void;
  applyToOpportunity: (opportunityId: string) => Application | null;
  getApplication: (opportunityId: string) => Application | undefined;
  addOpportunity: (input: NewOpportunityInput) => Opportunity;
  setApplicantStatus: (applicantId: string, status: ApplicantStatus) => void;
  updateClubProfile: (patch: Partial<ClubProfile>) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== STORAGE_VERSION) return null;
    return { ...initialState(), ...parsed } as AppState;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // One-time hydration from localStorage after mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    const stored = loadState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-off sync from browser storage
    if (stored) setState(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be unavailable (private mode); the app still works in memory.
    }
  }, [state, hydrated]);

  const setProfile = useCallback((profile: PlayerProfile) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  const updateProfile = useCallback((patch: Partial<PlayerProfile>) => {
    setState((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s));
  }, []);

  const markViewed = useCallback((opportunityId: string) => {
    setState((s) =>
      s.viewedIds.includes(opportunityId)
        ? s
        : { ...s, viewedIds: [...s.viewedIds, opportunityId] },
    );
  }, []);

  const getApplication = useCallback(
    (opportunityId: string) => state.applications.find((a) => a.opportunityId === opportunityId),
    [state.applications],
  );

  const applyToOpportunity = useCallback(
    (opportunityId: string): Application | null => {
      const existing = state.applications.find((a) => a.opportunityId === opportunityId);
      if (existing) return existing;
      if (!state.profile) return null;
      const now = new Date().toISOString();
      const application: Application = {
        id: uid("app"),
        opportunityId,
        status: "applied",
        appliedAt: now,
      };
      const opportunity = state.opportunities.find((o) => o.id === opportunityId);
      const profile = state.profile;
      setState((s) => {
        const next: AppState = { ...s, applications: [application, ...s.applications] };
        // If the opportunity belongs to the demo club, the club sees this application too.
        if (opportunity && opportunity.organizerId === s.clubProfile.id) {
          const applicant: ClubApplicant = {
            id: uid("ca"),
            opportunityId,
            name: profile.name,
            age: profile.age,
            position: profile.position,
            location: profile.location,
            level: profile.level,
            goal: profile.goal,
            status: "new",
            appliedAt: now,
            isCurrentPlayer: true,
          };
          next.clubApplicants = [applicant, ...s.clubApplicants];
        }
        return next;
      });
      return application;
    },
    [state.applications, state.profile, state.opportunities],
  );

  const addOpportunity = useCallback(
    (input: NewOpportunityInput): Opportunity => {
      const opportunity: Opportunity = {
        ...input,
        id: uid("opp"),
        sport: "Football",
        organizer: state.clubProfile.name,
        organizerId: state.clubProfile.id,
        isDemo: false,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, opportunities: [opportunity, ...s.opportunities] }));
      return opportunity;
    },
    [state.clubProfile],
  );

  const setApplicantStatus = useCallback((applicantId: string, status: ApplicantStatus) => {
    setState((s) => ({
      ...s,
      clubApplicants: s.clubApplicants.map((a) => (a.id === applicantId ? { ...a, status } : a)),
    }));
  }, []);

  const updateClubProfile = useCallback((patch: Partial<ClubProfile>) => {
    setState((s) => ({ ...s, clubProfile: { ...s.clubProfile, ...patch } }));
  }, []);

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(initialState());
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      hydrated,
      setProfile,
      updateProfile,
      markViewed,
      applyToOpportunity,
      getApplication,
      addOpportunity,
      setApplicantStatus,
      updateClubProfile,
      resetDemo,
    }),
    [
      state,
      hydrated,
      setProfile,
      updateProfile,
      markViewed,
      applyToOpportunity,
      getApplication,
      addOpportunity,
      setApplicantStatus,
      updateClubProfile,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

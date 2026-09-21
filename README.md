# Grassroots Athlete Opportunity Network

> Helping athletes discover the right opportunities at the right time.

A functional MVP prototype built for the E-Cell Junior Prototype Development & Demonstration assignment.
It connects grassroots football **players** with **opportunities** (trials, tournaments, selection camps,
academy days) published by **clubs**.

**Core loop:** Discover → Match → Apply → Track

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. For a production build: `npm run build && npm start`.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- lucide-react icons
- Local state persisted to `localStorage` (no backend needed for the prototype)

## Project structure

```
app/
  page.tsx                       Landing page
  player/onboarding              Profile setup
  player/(app)/dashboard         Recommended opportunities + Smart Match reasons
  player/(app)/opportunities     Discovery with search + filters
  player/(app)/opportunities/[id] Opportunity details + Apply flow
  player/(app)/applications      Applied / Upcoming / Completed tracking
  player/(app)/profile           Profile + stats + editing
  club/dashboard                 Club stats + published opportunities
  club/opportunities             Manage opportunities
  club/opportunities/new         Create & publish an opportunity
  club/applications              Review + shortlist applicants
  club/profile                   Club profile
components/                      OpportunityCard, DashboardCard, ProfileCard, MatchReasons,
                                 Navigation, ClubOpportunityRow, ui/ (Button, Badge, Card, Field, Modal)
data/                            Demo opportunities, applicants and profiles (all fictional)
lib/
  store.tsx                      App state + localStorage persistence + actions
  matching.ts                    Rule-based Smart Match (age, position, location, level, deadline)
  geo.ts                         City distance lookup
  utils.ts                       Dates, formatting helpers
types/                           Shared TypeScript types
```

## How matching works

`lib/matching.ts` scores each opportunity against the player profile:

| Rule                        | Points |
| --------------------------- | ------ |
| Age within eligibility      | 35     |
| Position wanted             | 20     |
| Location (same city / near) | 20     |
| Playing level               | 15     |
| Registration still open     | 10     |

Scores map to *Strong / Good / Partial / Low match*, and every reason is shown to the player as
"Why this opportunity matches you". This is deliberately simple and transparent - it is the foundation a
smarter recommendation layer can be built on later.

## Suggested demo script (3–4 minutes)

**Player**

1. Landing page → **Find Opportunities**
2. Onboarding → *Fill with demo profile* → **Create My Profile**
3. Dashboard → open *Why this opportunity matches you* on the U-17 Football Trial
4. **View Opportunity** → **Apply Now** → **Confirm Application** → *Application Submitted ✓*
5. **View My Applications** → Applied / Upcoming / Completed tabs

**Club**

6. *Switch role* → **I'm a Club** → Club Dashboard (Arjun's application already appears under *Recent applications*)
7. **Create Opportunity** → *Fill with example* → **Publish Opportunity** → *Opportunity Published ✓*
8. *Switch role* → player **Opportunities** → the new listing appears with a *Just published* badge
9. Back to the club → **Applications** → *View Profile* / *Shortlist*

> "The goal is simple: players shouldn't miss opportunities just because they didn't know they existed."

## Demo data

All clubs, organisers, opportunities and applicants are fictional sample data created for the prototype.
Use **Reset demo data** (bottom of either profile page) to start a recording from a clean state.

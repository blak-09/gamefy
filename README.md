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

## AI features for clubs

The club side has five AI-assisted features. All of them run on **transparent, deterministic rules in the
browser** (`lib/ai.ts`) — no external model or API key. The UI labels them *AI Match / AI Shortlist / AI Insight*
and each card carries a small prototype note explaining how it works.

| Feature | Where | What it does |
| --- | --- | --- |
| ✨ AI Player Matches | Club Dashboard, `/club/opportunities/[id]` | Ranks demo players registered on the platform against an opportunity (age 40 · position 25 · location 20 · level 15) with ✓/✗ reasons and *View Profile* |
| ✨ AI Shortlist | Applications | *Generate AI Shortlist* ranks the applicants for the selected opportunity, explains why each one fits, and can shortlist them in one click |
| 🧠 AI Application Summary | Applications | Counts strong / review / no-match applicants and writes a one-line insight from the real demo data |
| ✨ Create with AI | Create Opportunity | Turns "Create an U-17 striker trial in Faridabad next weekend" into a fully filled, editable draft. Nothing is published until the club clicks Publish |
| 🧠 AI Insight | Club Dashboard | Two or three short, data-derived observations (local interest, untapped matches, deadline pressure) |

Demo players live in `data/players.ts`; the extra applicants in `data/demo.ts` give the summary meaningful tiers.

## Suggested club AI demo (2–3 minutes)

1. Club Dashboard → read the **AI Insight** card
2. **Open** the U-17 Football Trial → **AI Player Matches** → *View Profile*
3. **View Applications** → **AI Application Summary** → **Generate AI Shortlist** → *Shortlist all recommended*
4. **Create Opportunity** → type *"Create an U-17 striker trial in Faridabad next weekend."* → **Generate Opportunity**
5. Edit anything → **Publish Opportunity** → it appears on the dashboard and in the player listing

## Suggested full demo script (3–4 minutes)

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

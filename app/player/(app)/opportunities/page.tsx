"use client";

import { useMemo, useState } from "react";
import { Search, SearchX, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { OpportunityCard } from "@/components/OpportunityCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useApp } from "@/lib/store";
import { matchOpportunity } from "@/lib/matching";
import { distanceBetween } from "@/lib/geo";
import { daysUntil } from "@/lib/utils";
import { OPPORTUNITY_TYPES } from "@/types";

type SortKey = "match" | "date" | "deadline";

const AGE_FILTERS = ["All", "U-14", "U-16", "U-17", "U-19", "Open"];
const DATE_FILTERS: { value: string; label: string; maxDays: number }[] = [
  { value: "any", label: "Any date", maxDays: Infinity },
  { value: "week", label: "This week", maxDays: 7 },
  { value: "month", label: "Next 30 days", maxDays: 30 },
  { value: "quarter", label: "Next 3 months", maxDays: 92 },
];
const DISTANCE_FILTERS: { value: string; label: string; maxKm: number }[] = [
  { value: "any", label: "Any distance", maxKm: Infinity },
  { value: "10", label: "Within 10 km", maxKm: 10 },
  { value: "25", label: "Within 25 km", maxKm: 25 },
  { value: "50", label: "Within 50 km", maxKm: 50 },
  { value: "100", label: "Within 100 km", maxKm: 100 },
];

export default function OpportunitiesPage() {
  const { profile, opportunities, applications } = useApp();
  const [query, setQuery] = useState("");
  const [age, setAge] = useState("All");
  const [location, setLocation] = useState("All");
  const [type, setType] = useState("All");
  const [date, setDate] = useState("any");
  const [distance, setDistance] = useState("any");
  const [sort, setSort] = useState<SortKey>("match");
  const [showFilters, setShowFilters] = useState(false);

  const appliedIds = useMemo(() => new Set(applications.map((a) => a.opportunityId)), [applications]);
  const cities = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.city))).sort(),
    [opportunities],
  );

  const results = useMemo(() => {
    if (!profile) return [];
    const q = query.trim().toLowerCase();
    const maxDays = DATE_FILTERS.find((d) => d.value === date)?.maxDays ?? Infinity;
    const maxKm = DISTANCE_FILTERS.find((d) => d.value === distance)?.maxKm ?? Infinity;

    return opportunities
      .filter((o) => daysUntil(o.date) >= 0)
      .filter((o) => !q || o.title.toLowerCase().includes(q) || o.organizer.toLowerCase().includes(q))
      .filter((o) => age === "All" || o.ageLabel === age)
      .filter((o) => location === "All" || o.city === location)
      .filter((o) => type === "All" || o.type === type)
      .filter((o) => daysUntil(o.date) <= maxDays)
      .filter((o) => {
        if (maxKm === Infinity) return true;
        const km = distanceBetween(profile.location, o.city);
        return km !== undefined && km <= maxKm;
      })
      .map((opportunity) => ({ opportunity, match: matchOpportunity(profile, opportunity) }))
      .sort((a, b) => {
        if (sort === "match") return b.match.score - a.match.score;
        if (sort === "date") return daysUntil(a.opportunity.date) - daysUntil(b.opportunity.date);
        return daysUntil(a.opportunity.deadline) - daysUntil(b.opportunity.deadline);
      });
  }, [profile, opportunities, query, age, location, type, date, distance, sort]);

  const activeFilterCount = [age !== "All", location !== "All", type !== "All", date !== "any", distance !== "any"].filter(
    Boolean,
  ).length;

  const reset = () => {
    setQuery("");
    setAge("All");
    setLocation("All");
    setType("All");
    setDate("any");
    setDistance("any");
  };

  return (
    <div>
      <PageHeader
        title="Find your next opportunity"
        subtitle="Trials, tournaments, selection camps and academy days near you."
      />

      {/* Search + filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by opportunity name or club"
              className="pl-10"
              aria-label="Search opportunities"
            />
          </div>
          <Button variant="secondary" onClick={() => setShowFilters((v) => !v)} className="sm:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </Button>
        </div>

        <div className={`${showFilters ? "grid" : "hidden"} mt-4 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-6`}>
          <Select value="Football" disabled aria-label="Sport">
            <option>Football</option>
          </Select>
          <Select value={age} onChange={(e) => setAge(e.target.value)} aria-label="Age group">
            {AGE_FILTERS.map((a) => (
              <option key={a} value={a}>
                {a === "All" ? "All age groups" : a}
              </option>
            ))}
          </Select>
          <Select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location">
            <option value="All">All locations</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Opportunity type">
            <option value="All">All types</option>
            {OPPORTUNITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date">
            {DATE_FILTERS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
          <Select value={distance} onChange={(e) => setDistance(e.target.value)} aria-label="Distance">
            {DISTANCE_FILTERS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Results header */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{results.length}</span>{" "}
          {results.length === 1 ? "opportunity" : "opportunities"}
          {(activeFilterCount > 0 || query) && (
            <button type="button" onClick={reset} className="ml-3 font-medium text-blue-700 hover:underline">
              Clear filters
            </button>
          )}
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800"
          >
            <option value="match">Best match</option>
            <option value="deadline">Deadline</option>
            <option value="date">Event date</option>
          </select>
        </label>
      </div>

      {results.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={SearchX}
            title="No opportunities match these filters"
            description="Try widening the distance or clearing a filter."
            action={
              <Button variant="secondary" size="sm" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map(({ opportunity, match }) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              match={match}
              applied={appliedIds.has(opportunity.id)}
              isNew={!opportunity.isDemo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

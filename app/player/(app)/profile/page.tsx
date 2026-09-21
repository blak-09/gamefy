"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck, ClipboardList, Eye, PencilLine, RotateCcw, Trophy } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { ProfileCard } from "@/components/ProfileCard";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Field";
import { useApp } from "@/lib/store";
import { CITIES } from "@/lib/geo";
import { formatDate } from "@/lib/utils";
import { LEVELS, PLAYER_GOALS, POSITIONS, type PlayerProfile, type PlayingLevel, type Position } from "@/types";

export default function ProfilePage() {
  const { profile, updateProfile, applications, opportunities, viewedIds, resetDemo } = useApp();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PlayerProfile | null>(null);
  const [saved, setSaved] = useState(false);

  if (!profile) return null;

  const applied = applications.filter((a) => a.status === "applied" || a.status === "registered");
  const upcoming = applications.filter((a) => a.status === "upcoming");
  const completed = applications.filter((a) => a.status === "completed");

  const startEdit = () => {
    setDraft({ ...profile });
    setEditing(true);
    setSaved(false);
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim() || !draft.age) return;
    updateProfile({ ...draft, name: draft.name.trim() });
    setEditing(false);
    setSaved(true);
  };

  const onReset = () => {
    if (window.confirm("Reset all demo data? Your profile, applications and any opportunities you published will be cleared.")) {
      resetDemo();
      router.push("/");
    }
  };

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="This is what clubs see when you apply."
        action={
          !editing && (
            <Button variant="secondary" size="sm" onClick={startEdit}>
              <PencilLine className="h-4 w-4" />
              Edit profile
            </Button>
          )
        }
      />

      <Card>
        {editing && draft ? (
          <form onSubmit={onSave} className="animate-fade-in">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" htmlFor="p-name" className="sm:col-span-2">
                <Input id="p-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </Field>
              <Field label="Age" htmlFor="p-age">
                <Input
                  id="p-age"
                  type="number"
                  min={8}
                  max={40}
                  value={draft.age}
                  onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
                />
              </Field>
              <Field label="Location" htmlFor="p-location">
                <Select id="p-location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Position" htmlFor="p-position">
                <Select
                  id="p-position"
                  value={draft.position}
                  onChange={(e) => setDraft({ ...draft, position: e.target.value as Position })}
                >
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Playing Level" htmlFor="p-level">
                <Select id="p-level" value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value as PlayingLevel })}>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Goal" htmlFor="p-goal" className="sm:col-span-2">
                <Select id="p-goal" value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })}>
                  {PLAYER_GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        ) : (
          <div>
            <ProfileCard profile={profile} size="lg" />
            {saved && (
              <p className="mt-4 inline-block rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                Profile updated. Your recommendations reflect the change.
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard icon={Eye} label="Opportunities viewed" value={viewedIds.length} tone="blue" />
        <DashboardCard icon={ClipboardList} label="Applications" value={applied.length} tone="green" />
        <DashboardCard icon={CalendarCheck} label="Upcoming" value={upcoming.length} tone="violet" />
        <DashboardCard icon={Trophy} label="Participated in" value={completed.length} tone="amber" />
      </div>

      <section className="mt-8">
        <SectionTitle
          title="Applications"
          action={
            <Link
              href="/player/applications"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <Card padding="none" className="mt-4 divide-y divide-slate-100">
          {applications.length === 0 && <p className="p-5 text-sm text-slate-500">No applications yet.</p>}
          {applications.slice(0, 5).map((a) => {
            const opp = opportunities.find((o) => o.id === a.opportunityId);
            if (!opp) return null;
            return (
              <Link
                key={a.id}
                href={`/player/opportunities/${opp.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{opp.title}</p>
                  <p className="text-xs text-slate-500">
                    {opp.organizer} · {formatDate(opp.date, "short")}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            );
          })}
        </Card>
      </section>

      <div className="mt-10 flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Prototype data lives in this browser only.</span>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-red-600"
        >
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </button>
      </div>
    </div>
  );
}

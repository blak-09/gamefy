"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarDays, Mail, MapPin, Megaphone, PencilLine, RotateCcw, Users } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useApp } from "@/lib/store";
import { CITIES } from "@/lib/geo";
import type { ClubProfile } from "@/types";

export default function ClubProfilePage() {
  const { clubProfile, updateClubProfile, opportunities, clubApplicants, resetDemo } = useApp();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ClubProfile>(clubProfile);

  const mine = opportunities.filter((o) => o.organizerId === clubProfile.id);

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    updateClubProfile({ ...draft, name: draft.name.trim() });
    setEditing(false);
  };

  const onReset = () => {
    if (window.confirm("Reset all demo data? This clears published opportunities, applications and the player profile.")) {
      resetDemo();
      router.push("/");
    }
  };

  return (
    <div>
      <PageHeader
        title="Club Profile"
        subtitle="How your club appears to players on each opportunity."
        action={
          !editing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDraft(clubProfile);
                setEditing(true);
              }}
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </Button>
          )
        }
      />

      <Card>
        {editing ? (
          <form onSubmit={onSave} className="animate-fade-in grid gap-5 sm:grid-cols-2">
            <Field label="Club name" htmlFor="c-name" required className="sm:col-span-2">
              <Input id="c-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Location" htmlFor="c-location">
              <Select id="c-location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Founded" htmlFor="c-founded">
              <Input id="c-founded" value={draft.founded} onChange={(e) => setDraft({ ...draft, founded: e.target.value })} />
            </Field>
            <Field label="Contact email" htmlFor="c-email" className="sm:col-span-2">
              <Input
                id="c-email"
                type="email"
                value={draft.contactEmail}
                onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })}
              />
            </Field>
            <Field label="About the club" htmlFor="c-desc" className="sm:col-span-2">
              <Textarea id="c-desc" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-sm">
              <Building2 className="h-9 w-9" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{clubProfile.name}</h2>
                <Badge tone="neutral">Demo club</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {clubProfile.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  Founded {clubProfile.founded}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {clubProfile.contactEmail}
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-700">{clubProfile.description}</p>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <DashboardCard icon={Megaphone} label="Opportunities published" value={mine.length} tone="green" />
        <DashboardCard icon={Users} label="Applications received" value={clubApplicants.length} tone="blue" />
      </div>

      <div className="mt-10 flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Prototype data lives in this browser only.</span>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-red-600">
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </button>
      </div>
    </div>
  );
}

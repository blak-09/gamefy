"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/Navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { AiOpportunityCreator } from "@/components/ai/AiOpportunityCreator";
import type { OpportunityDraft } from "@/lib/ai";
import { useApp } from "@/lib/store";
import { CITIES } from "@/lib/geo";
import { cn, parseISODate, toISODate } from "@/lib/utils";
import {
  AGE_GROUPS,
  LEVELS,
  OPPORTUNITY_TYPES,
  POSITIONS,
  type Opportunity,
  type OpportunityType,
  type PlayingLevel,
  type Position,
  type RegistrationMethod,
} from "@/types";

interface FormState {
  title: string;
  type: OpportunityType;
  ageGroup: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  deadline: string;
  position: Position | "any";
  level: PlayingLevel | "all";
  description: string;
  /** One requirement per line */
  requirements: string;
  registrationMethod: RegistrationMethod;
  externalUrl: string;
}

const EMPTY: FormState = {
  title: "",
  type: "Trial",
  ageGroup: "U-17",
  city: "",
  venue: "",
  date: "",
  time: "",
  deadline: "",
  position: "any",
  level: "all",
  description: "",
  requirements: "",
  registrationMethod: "platform",
  externalUrl: "",
};

function plusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

const EXAMPLE: FormState = {
  title: "U-15 Goalkeeper Trial",
  type: "Trial",
  ageGroup: "U-16",
  city: "Faridabad",
  venue: "Demo FC Training Ground, Sector 31",
  date: plusDays(20),
  time: "7:30 AM – 10:30 AM",
  deadline: plusDays(12),
  position: "Goalkeeper",
  level: "Grassroots",
  description:
    "We are looking for two goalkeepers to join our U-15 squad for the upcoming season. The session includes shot-stopping, distribution and small-sided games with our goalkeeping coach.",
  requirements: ["Age 13–16 on the day", "Age proof", "Parent or guardian consent"].join("\n"),
  registrationMethod: "platform",
  externalUrl: "",
};

export default function CreateOpportunityPage() {
  const { addOpportunity } = useApp();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<Opportunity | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const applyDraft = (draft: OpportunityDraft) => {
    setForm({
      title: draft.title,
      type: draft.type,
      ageGroup: draft.ageGroup,
      city: draft.city,
      venue: draft.venue,
      date: draft.date,
      time: draft.time,
      deadline: draft.deadline,
      position: draft.position,
      level: draft.level,
      description: draft.description,
      requirements: draft.requirements.join("\n"),
      registrationMethod: "platform",
      externalUrl: "",
    });
    setError(null);
    document.getElementById("title")?.focus();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.city || !form.date || !form.deadline || !form.description.trim()) {
      setError("Please fill in the title, location, date, registration deadline and description.");
      return;
    }
    if (parseISODate(form.deadline) > parseISODate(form.date)) {
      setError("The registration deadline should be on or before the event date.");
      return;
    }
    if (form.registrationMethod === "external" && !form.externalUrl.trim()) {
      setError("Add the link to your registration form, or switch to applications on this platform.");
      return;
    }
    const group = AGE_GROUPS.find((g) => g.label === form.ageGroup) ?? AGE_GROUPS[2];
    const requirementLines = form.requirements
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const created = addOpportunity({
      title: form.title.trim(),
      type: form.type,
      city: form.city,
      venue: form.venue.trim() || form.city,
      date: form.date,
      time: form.time.trim() || "Timing to be confirmed",
      deadline: form.deadline,
      ageLabel: group.label,
      ageMin: group.min,
      ageMax: group.max,
      positions: form.position === "any" ? "any" : [form.position],
      levels: form.level === "all" ? "all" : [form.level],
      description: form.description.trim(),
      entryRequirements: requirementLines.length
        ? requirementLines
        : [`Age ${group.min}–${group.max}`, "Age proof", "Parent or guardian consent for players under 18"],
      whatToBring: ["Football boots and shin guards", "Water bottle"],
      registrationMethod: form.registrationMethod,
      externalUrl: form.registrationMethod === "external" ? form.externalUrl.trim() : undefined,
    });
    setPublished(created);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (published) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Opportunity Published ✓</h1>
        <p className="mt-3 text-slate-600">
          <span className="font-medium text-slate-900">{published.title}</span> is now live in the opportunity list.
          Players whose age, position and location fit will see it in their recommendations.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/club/opportunities">View in Opportunities</ButtonLink>
          <ButtonLink href="/club/dashboard" variant="secondary">
            Back to Dashboard
          </ButtonLink>
        </div>
        <button
          type="button"
          onClick={() => {
            setPublished(null);
            setForm(EMPTY);
          }}
          className="mt-6 text-sm font-medium text-blue-700 hover:underline"
        >
          Create another opportunity
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/club/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>
      <PageHeader
        title="Create Opportunity"
        subtitle="Fill in the details once. Matching players will see it straight away."
        action={
          <Button variant="ghost" size="sm" onClick={() => setForm(EXAMPLE)}>
            <Wand2 className="h-4 w-4" />
            Fill with example
          </Button>
        }
      />

      <div className="mb-6">
        <AiOpportunityCreator onDraft={applyDraft} />
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Basics</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Opportunity Title" htmlFor="title" required className="sm:col-span-2">
              <Input id="title" placeholder="e.g. U-17 Football Trial" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Opportunity Type" htmlFor="type" required>
              <Select id="type" value={form.type} onChange={(e) => set("type", e.target.value as OpportunityType)}>
                {OPPORTUNITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Age Group" htmlFor="ageGroup" required>
              <Select id="ageGroup" value={form.ageGroup} onChange={(e) => set("ageGroup", e.target.value)}>
                {AGE_GROUPS.map((g) => (
                  <option key={g.label} value={g.label}>
                    {g.label} ({g.min}–{g.max} years)
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Location" htmlFor="city" required>
              <Select id="city" value={form.city} onChange={(e) => set("city", e.target.value)}>
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Venue" htmlFor="venue" hint="Ground or stadium name">
              <Input id="venue" placeholder="e.g. Sector 12 Sports Complex" value={form.venue} onChange={(e) => set("venue", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Schedule</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <Field label="Date" htmlFor="date" required>
              <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Registration Deadline" htmlFor="deadline" required>
              <Input id="deadline" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            </Field>
            <Field label="Time" htmlFor="time">
              <Input id="time" placeholder="e.g. 7:00 AM – 10:00 AM" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Who is it for?</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Required Position" htmlFor="position">
              <Select id="position" value={form.position} onChange={(e) => set("position", e.target.value as Position | "any")}>
                <option value="any">Any position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Playing Level" htmlFor="level">
              <Select id="level" value={form.level} onChange={(e) => set("level", e.target.value as PlayingLevel | "all")}>
                <option value="all">All levels</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Description" htmlFor="description" required className="sm:col-span-2">
              <Textarea
                id="description"
                placeholder="What happens on the day, what you are looking for, and anything players should know."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Entry requirements" htmlFor="requirements" hint="One per line" className="sm:col-span-2">
              <Textarea
                id="requirements"
                placeholder={"Age proof\nParent or guardian consent for players under 18"}
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                className="min-h-[90px]"
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">Registration method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: "platform", title: "Applications on this platform", text: "Players apply with their profile. You review them here." },
                { value: "external", title: "External registration link", text: "Players are sent to your own form or website." },
              ] as { value: RegistrationMethod; title: string; text: string }[]
            ).map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                  form.registrationMethod === opt.value
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  name="registrationMethod"
                  value={opt.value}
                  checked={form.registrationMethod === opt.value}
                  onChange={() => set("registrationMethod", opt.value)}
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{opt.title}</span>
                  <span className="block text-sm text-slate-500">{opt.text}</span>
                </span>
              </label>
            ))}
          </div>
          {form.registrationMethod === "external" && (
            <Field label="Registration link" htmlFor="externalUrl" required className="mt-4 animate-fade-in">
              <Input
                id="externalUrl"
                type="url"
                placeholder="https://"
                value={form.externalUrl}
                onChange={(e) => set("externalUrl", e.target.value)}
              />
            </Field>
          )}
        </Card>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ButtonLink href="/club/dashboard" variant="ghost">
            Cancel
          </ButtonLink>
          <Button type="submit" size="lg">
            Publish Opportunity
          </Button>
        </div>
      </form>
    </div>
  );
}

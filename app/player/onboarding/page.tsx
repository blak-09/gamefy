"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useApp } from "@/lib/store";
import { CITIES } from "@/lib/geo";
import { DEMO_PLAYER_PROFILE } from "@/data/demo";
import { LEVELS, PLAYER_GOALS, POSITIONS, type PlayerProfile, type PlayingLevel, type Position } from "@/types";

interface FormState {
  name: string;
  age: string;
  location: string;
  position: Position | "";
  level: PlayingLevel | "";
  goal: string;
}

const EMPTY: FormState = { name: "", age: "", location: "", position: "", level: "", goal: "" };

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, profile } = useApp();
  const [form, setForm] = useState<FormState>(() =>
    profile
      ? {
          name: profile.name,
          age: String(profile.age),
          location: profile.location,
          position: profile.position,
          level: profile.level,
          goal: profile.goal,
        }
      : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const fillDemo = () => {
    setForm({
      name: DEMO_PLAYER_PROFILE.name,
      age: String(DEMO_PLAYER_PROFILE.age),
      location: DEMO_PLAYER_PROFILE.location,
      position: DEMO_PLAYER_PROFILE.position,
      level: DEMO_PLAYER_PROFILE.level,
      goal: DEMO_PLAYER_PROFILE.goal,
    });
    setError(null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const age = Number(form.age);
    if (!form.name.trim() || !form.age || !form.location || !form.position || !form.level || !form.goal) {
      setError("Please fill in every field so we can match you properly.");
      return;
    }
    if (!Number.isInteger(age) || age < 8 || age > 40) {
      setError("Please enter an age between 8 and 40.");
      return;
    }
    const next: PlayerProfile = {
      name: form.name.trim(),
      age,
      location: form.location,
      position: form.position,
      level: form.level,
      goal: form.goal,
    };
    setProfile(next);
    router.push("/player/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Step 1 of 1</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Set up your player profile</h1>
          <p className="mt-2 text-slate-600">
            We use this to show you trials and tournaments you are actually eligible for. It takes under a minute.
          </p>
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="name" required className="sm:col-span-2">
              <Input id="name" placeholder="e.g. Arjun Kumar" value={form.name} onChange={update("name")} autoComplete="name" />
            </Field>
            <Field label="Age" htmlFor="age" required>
              <Input id="age" type="number" min={8} max={40} placeholder="16" value={form.age} onChange={update("age")} />
            </Field>
            <Field label="Location" htmlFor="location" required>
              <Select id="location" value={form.location} onChange={update("location")}>
                <option value="">Select your city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Position" htmlFor="position" required>
              <Select id="position" value={form.position} onChange={update("position")}>
                <option value="">Select position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Playing Level" htmlFor="level" required>
              <Select id="level" value={form.level} onChange={update("level")}>
                <option value="">Select level</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Goal" htmlFor="goal" required className="sm:col-span-2" hint="What are you looking for right now?">
              <Select id="goal" value={form.goal} onChange={update("goal")}>
                <option value="">Select your goal</option>
                {PLAYER_GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {error && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={fillDemo}>
              <Wand2 className="h-4 w-4" />
              Fill with demo profile
            </Button>
            <Button type="submit" size="lg">
              Create My Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Prototype: your profile is stored only in this browser.
        </p>
      </main>
    </div>
  );
}

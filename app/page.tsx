"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  Compass,
  Hourglass,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SmartMatchLabel } from "@/components/MatchReasons";
import { useApp } from "@/lib/store";

const SOURCES = ["Instagram", "WhatsApp groups", "Academies", "Coaches", "Clubs", "Websites", "Word of mouth"];

const STEPS = [
  {
    icon: Compass,
    title: "Discover",
    text: "Trials, tournaments, selection camps and academy days - collected in one place.",
  },
  {
    icon: Sparkles,
    title: "Match",
    text: "See which ones fit your age, position, location and level, and why.",
  },
  {
    icon: Send,
    title: "Apply",
    text: "Apply in a couple of taps before the registration window closes.",
  },
  {
    icon: ClipboardList,
    title: "Track",
    text: "Keep every application, upcoming event and result in one list.",
  },
];

export default function LandingPage() {
  const { profile } = useApp();
  const playerHref = profile ? "/player/dashboard" : "/player/onboarding";

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/club/dashboard"
              className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block"
            >
              I&apos;m a Club
            </Link>
            <ButtonLink href={playerHref} size="sm">
              Find Opportunities
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pitch-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200/50 to-emerald-200/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Built for grassroots football players
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              The right opportunity can change a player&apos;s journey.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Find football trials, tournaments and selection opportunities matched to your age, location and
              goals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={playerHref} size="lg">
                Find Opportunities
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/club/dashboard" size="lg" variant="secondary">
                <Building2 className="h-4 w-4" />
                I&apos;m a Club
              </ButtonLink>
            </div>
            <p className="mt-8 text-sm font-medium text-slate-500">
              Train hard. Find the right opportunity. Take the next step.
            </p>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-full border-[6px] border-slate-200/70 lg:block" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Recommended for you</p>
                <SmartMatchLabel />
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="blue">Trial</Badge>
                  <Badge tone="neutral">U-17</Badge>
                </div>
                <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">U-17 Football Trial</p>
                <p className="text-sm text-slate-500">Demo Football Club</p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" /> Faridabad · In your city
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" /> 28 September 2026
                  </li>
                  <li className="flex items-center gap-2 font-medium text-amber-700">
                    <Hourglass className="h-4 w-4 text-amber-500" /> Registration closes in 3 days
                  </li>
                </ul>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Why this matches you</p>
                <ul className="mt-2.5 space-y-1.5 text-sm text-slate-700">
                  {[
                    "You are in the eligible age group",
                    "Position: Striker",
                    "Near your location",
                    "Registration is still open",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">The problem</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Opportunities exist. Finding them in time is the hard part.
              </h2>
              <p className="mt-4 text-slate-600">
                Trials and tournaments get announced on Instagram stories, forwarded in WhatsApp groups, pinned on
                academy notice boards or passed on by a coach. Players hear about them late, miss the registration
                deadline, or can&apos;t tell whether they are even eligible.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-sm text-slate-500"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="my-5 flex items-center gap-3 text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <ArrowRight className="h-4 w-4" />
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-sm font-semibold">One place, matched to the player.</p>
                <p className="mt-1 text-sm text-slate-300">
                  Every opportunity with its date, deadline, age group and location - and whether it fits you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Discover, match, apply, track.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-400">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs */}
      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">For clubs & academies</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Post once. Reach the right players.</h2>
              <p className="mt-3 text-slate-300">
                Publish a trial or tournament, receive applications with player profiles, and shortlist the ones
                that fit your squad.
              </p>
            </div>
            <div className="mt-8 lg:mt-0">
              <ButtonLink href="/club/dashboard" size="lg" variant="success">
                Open Club Dashboard
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Grassroots Athlete Opportunity Network · Prototype</p>
          <p>All opportunities, clubs and players shown are sample data for demonstration.</p>
        </div>
      </footer>
    </div>
  );
}

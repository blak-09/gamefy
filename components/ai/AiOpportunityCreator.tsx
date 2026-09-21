"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { draftOpportunityFromPrompt, type OpportunityDraft } from "@/lib/ai";
import { useApp } from "@/lib/store";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Field";
import { AiBadge, AiNote } from "./AiBadge";

const EXAMPLES = [
  "Create an U-17 striker trial in Faridabad next weekend.",
  "U-15 goalkeeper selection camp in Gurugram on 18 October, grassroots level.",
  "Open-age weekend tournament in Delhi in two weeks.",
];

export function AiOpportunityCreator({ onDraft }: { onDraft: (draft: OpportunityDraft) => void }) {
  const { clubProfile } = useApp();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<OpportunityDraft | null>(null);

  const generate = (e?: FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    setBusy(true);
    // Short pause so the generation step is visible in a demo; the parser itself is instant.
    window.setTimeout(() => {
      const next = draftOpportunityFromPrompt(prompt, clubProfile.name, clubProfile.location);
      setDraft(next);
      onDraft(next);
      setBusy(false);
    }, 700);
  };

  return (
    <Card className="border-violet-100 bg-gradient-to-br from-violet-50/60 to-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Create with AI</h2>
          <AiBadge label="Optional" />
        </div>
        <p className="text-xs text-slate-500">Describe the opportunity in one line — the form fills itself.</p>
      </div>

      <form onSubmit={generate} className="mt-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "Create an U-17 striker trial in Faridabad next weekend."'
          className="min-h-[76px] bg-white"
          aria-label="Describe the opportunity"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              generate();
            }
          }}
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                {ex}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={!prompt.trim() || busy} className="shrink-0">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Generating…" : "Generate Opportunity"}
          </Button>
        </div>
      </form>

      {draft && !busy && (
        <div className="animate-fade-in mt-4 rounded-xl border border-slate-200/70 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filled in below from your request</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {draft.understood.map((u) => (
              <li key={u.label} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800 ring-1 ring-inset ring-emerald-200">
                <span className="font-medium">{u.label}:</span> {u.value}
              </li>
            ))}
          </ul>
          {draft.missing.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Not mentioned, so defaults were used: {draft.missing.join("; ")}. Edit anything below before publishing.
            </p>
          )}
        </div>
      )}

      <AiNote className="mt-3">
        Prototype: the draft is generated with keyword and date rules from your request. Nothing is published until you
        click Publish Opportunity.
      </AiNote>
    </Card>
  );
}

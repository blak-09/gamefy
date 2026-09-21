import type { LucideIcon } from "lucide-react";
import { Card } from "./ui/Card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "violet" | "amber";
}

const tones = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

export function DashboardCard({ label, value, hint, icon: Icon, tone = "blue" }: DashboardCardProps) {
  return (
    <Card padding="sm" className="flex items-center gap-4">
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        <p className="truncate text-sm text-slate-500">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
    </Card>
  );
}

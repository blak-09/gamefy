import { MapPin, Target } from "lucide-react";
import type { PlayerProfile } from "@/types";
import { cn, initials } from "@/lib/utils";
import { Badge } from "./ui/Badge";

interface ProfileCardProps {
  profile: PlayerProfile;
  size?: "sm" | "lg";
  className?: string;
}

export function ProfileAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-10 w-10 text-sm", md: "h-14 w-14 text-lg", lg: "h-20 w-20 text-2xl" };
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 font-bold text-white shadow-sm",
        sizes[size],
      )}
    >
      {initials(name)}
    </span>
  );
}

export function ProfileCard({ profile, size = "sm", className }: ProfileCardProps) {
  if (size === "lg") {
    return (
      <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-center", className)}>
        <ProfileAvatar name={profile.name} size="lg" />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{profile.name}</h2>
          <p className="mt-1 text-slate-600">
            {profile.age} | {profile.position} | {profile.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="blue">{profile.level}</Badge>
            <Badge tone="neutral">
              <Target className="h-3 w-3" />
              {profile.goal}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ProfileAvatar name={profile.name} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{profile.name}</p>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <span>{profile.age}</span>
          <span className="text-slate-300">|</span>
          <span>{profile.position}</span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {profile.location}
          </span>
          <span className="text-slate-300">|</span>
          <span>{profile.level}</span>
        </p>
      </div>
    </div>
  );
}

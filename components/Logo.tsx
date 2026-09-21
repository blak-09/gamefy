import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v4.5M12 16.5V21M4.2 8.5l4.1 1.5M15.7 14l4.1 1.5M4.2 15.5l4.1-1.5M15.7 10l4.1-1.5" />
        <path d="M12 7.5l3.7 2.7-1.4 4.3H9.7L8.3 10.2z" fill="currentColor" stroke="none" opacity="0.9" />
      </svg>
    </span>
  );
}

interface LogoProps {
  href?: string;
  /** Hide the wordmark on small screens (used inside the app shell where space is tight). */
  compactOnMobile?: boolean;
}

export function Logo({ href = "/", compactOnMobile = false }: LogoProps) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5">
      <LogoMark />
      <span className={cn("leading-tight whitespace-nowrap", compactOnMobile && "hidden sm:block")}>
        <span className="block text-[15px] font-semibold tracking-tight text-slate-900">Grassroots Athlete</span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
          Opportunity Network
        </span>
      </span>
    </Link>
  );
}

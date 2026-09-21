import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-900/10 focus-visible:ring-slate-900",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 focus-visible:ring-emerald-600",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
}

function buttonClasses({ variant = "primary", size = "md", className, fullWidth }: StyleProps) {
  return cn(
    "inline-flex items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

type ButtonProps = StyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant, size, className, fullWidth, type = "button", ...rest }: ButtonProps) {
  return <button type={type} {...rest} className={buttonClasses({ variant, size, className, fullWidth })} />;
}

interface ButtonLinkProps extends StyleProps {
  href: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

export function ButtonLink({ href, children, target, rel, onClick, ...style }: ButtonLinkProps) {
  return (
    <Link href={href} target={target} rel={rel} onClick={onClick} className={buttonClasses(style)}>
      {children}
    </Link>
  );
}

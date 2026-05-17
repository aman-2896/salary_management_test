import { cn } from "../../lib/utils";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "info";
}

const variants = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  info:    "bg-blue-100 text-blue-700",
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      variants[variant]
    )}>
      {label}
    </span>
  );
}
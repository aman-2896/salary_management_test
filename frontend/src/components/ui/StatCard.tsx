import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, sub, icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4",
      className
    )}>
      {icon && (
        <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-semibold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
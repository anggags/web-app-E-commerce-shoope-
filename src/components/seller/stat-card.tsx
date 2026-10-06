import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const TONE_STYLES: Record<"default" | "warning" | "success" | "danger", string> = {
  default: "border-border/70 bg-card shadow-card",
  warning: "border-warning/40 bg-warning/5 shadow-card",
  success: "border-success/40 bg-success/5 shadow-card",
  danger: "border-destructive/40 bg-destructive/5 shadow-card",
};

const TONE_ICON: Record<"default" | "warning" | "success" | "danger", string> = {
  default: "bg-accent text-accent-foreground",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  danger: "bg-destructive/15 text-destructive",
};

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "default",
  price = false,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success" | "danger";
  price?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border p-5", TONE_STYLES[tone])}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            TONE_ICON[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-2xl font-bold tabular-nums",
          price && "price text-2xl font-bold",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
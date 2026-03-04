"use client";

import { Badge } from "@/components/ui/badge";

const config = {
  stable: { label: "Stable", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  warning: { label: "Warning", className: "bg-amber-100 text-amber-800 border-amber-200" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800 border-red-200 animate-pulse" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = config[status as keyof typeof config] ?? config.stable;
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

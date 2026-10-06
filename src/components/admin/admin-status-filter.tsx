"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminStatusFilter({
  filters,
  active,
  basePath,
}: {
  filters: { value: string; label: string }[];
  active: string;
  basePath: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.value}
          href={`${basePath}?status=${filter.value}`}
          className={cn(
            buttonVariants({ size: "sm", variant: filter.value === active ? "default" : "outline" }),
          )}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}
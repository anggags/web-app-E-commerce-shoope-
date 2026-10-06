"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SellerOrderFilters({
  filters,
  active,
}: {
  filters: { value: string; label: string }[];
  active: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.value}
          href={filter.value === "all" ? "/seller/orders" : `/seller/orders?status=${filter.value}`}
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

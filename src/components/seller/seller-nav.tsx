"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Store,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/products", label: "Produk", icon: Package },
  { href: "/seller/orders", label: "Pesanan masuk", icon: ClipboardList },
];

export function SellerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map((item) => {
        const isActive =
          item.href === "/seller" ? pathname === "/seller" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-success",
  PENDING: "bg-warning",
  SUSPENDED: "bg-destructive",
};

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "size-1.5 rounded-full",
        STATUS_TONE[status] ?? "bg-muted-foreground",
      )}
      aria-hidden
    />
  );
}

export function SellerHeader({
  storeName,
  storeStatus,
}: {
  storeName: string;
  storeStatus: string;
}) {
  return (
    <div className="border-b pb-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Store className="size-4 text-primary" /> {storeName}
      </p>
      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
        <StatusDot status={storeStatus} />
        {storeStatus}
      </span>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/generated/prisma/enums";

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Menunggu moderasi",
  ACTIVE: "Tayang",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
};

const STYLE: Record<ProductStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  ACTIVE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-destructive/15 text-destructive",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", STYLE[status])}>
      {PRODUCT_STATUS_LABEL[status]}
    </Badge>
  );
}

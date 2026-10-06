import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-card";

export default function SearchLoading() {
  return (
    <div className="space-y-6 pb-8" aria-busy="true" aria-label="Memuat hasil pencarian">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      <Skeleton className="h-14 rounded-2xl" />

      <ProductGridSkeleton count={8} />

      <div className="flex items-center justify-center gap-3 pt-2">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}
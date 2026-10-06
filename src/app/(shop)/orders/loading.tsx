import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-4 pb-8" aria-busy="true" aria-label="Memuat pesanan">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-56" />
      </div>

      {[0, 1, 2].map((order) => (
        <div key={order} className="overflow-hidden rounded-2xl border border-border/70">
          <Skeleton className="h-14 w-full" />
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

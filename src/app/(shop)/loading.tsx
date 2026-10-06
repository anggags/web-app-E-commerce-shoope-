import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-card";

export default function Loading() {
  return (
    <div className="space-y-14 pb-8" aria-busy="true" aria-label="Memuat beranda">
      <section className="overflow-hidden rounded-3xl border border-border/70 bg-card">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
          <div className="space-y-4">
            <Skeleton className="h-6 w-52 rounded-full" />
            <Skeleton className="h-9 w-full max-w-md" />
            <Skeleton className="h-9 w-3/4 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-2/3 max-w-md" />
            <div className="flex gap-3 pt-3">
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-[74px] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>

      <section>
        <Skeleton className="mb-5 h-7 w-44" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((chip) => (
            <Skeleton key={chip} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </section>

      <section>
        <Skeleton className="mb-5 h-7 w-40" />
        <ProductGridSkeleton count={4} />
      </section>

      <section>
        <Skeleton className="mb-5 h-7 w-36" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((card) => (
            <Skeleton key={card} className="h-24 rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
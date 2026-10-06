import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="space-y-8 pb-8" aria-busy="true" aria-label="Memuat detail produk">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((thumb) => (
              <Skeleton key={thumb} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />

          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              {[0, 1, 2].map((chip) => (
                <Skeleton key={chip} className="h-9 w-24 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-lg" />
            <Skeleton className="h-11 flex-1 rounded-lg" />
          </div>

          <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="grid gap-3">
          {[0, 1].map((review) => (
            <Skeleton key={review} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
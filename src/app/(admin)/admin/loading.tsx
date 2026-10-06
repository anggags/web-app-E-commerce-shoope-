import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 pb-8" aria-busy="true" aria-label="Memuat dashboard admin">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((card) => (
          <Skeleton key={card} className="h-32 rounded-2xl" />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70">
        <Skeleton className="h-14 w-full" />
        <div className="space-y-3 p-5">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-6 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

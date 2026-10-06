import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="space-y-6 pb-8" aria-busy="true" aria-label="Memuat keranjang">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {[0, 1].map((group) => (
            <div key={group} className="overflow-hidden rounded-2xl border border-border/70">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-4 p-4">
                {[0, 1].map((line) => (
                  <div key={line} className="flex gap-4">
                    <Skeleton className="size-20 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-16 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="h-72 rounded-2xl lg:sticky lg:top-28 lg:h-fit" />
      </div>
    </div>
  );
}

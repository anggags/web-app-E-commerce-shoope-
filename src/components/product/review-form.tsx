"use client";

import { useActionState } from "react";
import { Star } from "lucide-react";

import { submitReviewAction, type ReviewState } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState: ReviewState = { status: "idle" };

export function ReviewForm({
  orderItemId,
  productName,
}: {
  orderItemId: string;
  productName: string;
}) {
  const [state, formAction] = useActionState(submitReviewAction, initialState);

  if (state.status === "success") {
    return (
      <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
        Ulasan untuk &ldquo;{productName}&rdquo; terkirim.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2 rounded-lg border p-3">
      <input type="hidden" name="orderItemId" value={orderItemId} />
      <p className="text-sm font-medium">{productName}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={value}
              defaultChecked={value === 5}
              className="peer sr-only"
            />
            <Star
              className={cn(
                "size-5 text-muted-foreground/40 transition peer-checked:fill-yellow-400 peer-checked:text-yellow-400",
                "hover:fill-yellow-300 hover:text-yellow-300",
              )}
            />
            <span className="sr-only">{value} bintang</span>
          </label>
        ))}
      </div>
      <Textarea name="comment" rows={2} placeholder="Ceritakan pengalaman kamu (opsional)" />
      {state.status === "error" ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
      <Button type="submit" size="sm" variant="outline">
        Kirim ulasan
      </Button>
    </form>
  );
}

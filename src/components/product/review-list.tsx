import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Star } from "lucide-react";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string | null; image: string | null };
};

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Belum ada ulasan untuk produk ini.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {(review.user.name ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{review.user.name ?? "Pembeli"}</p>
              <p className="text-xs text-muted-foreground">
                {format(review.createdAt, "d MMMM yyyy", { locale: id })}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-0.5">
              {Array.from({ length: review.rating }, (_, index) => (
                <Star key={index} className="size-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
          {review.comment ? (
            <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

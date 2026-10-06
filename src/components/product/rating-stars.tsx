import { Star } from "lucide-react";

export function RatingStars({
  rating,
  ratingCount,
  className,
}: {
  rating: number;
  ratingCount: number;
  className?: string;
}) {
  const rounded = Math.round(rating);

  return (
    <div className={className}>
      <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`size-4 ${
              index < rounded ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"
            }`}
          />
        ))}
      </div>
      {ratingCount > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {rating.toFixed(1)} · {ratingCount} ulasan
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">Belum ada ulasan</p>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: { id: string; url: string; alt: string | null }[];
  alt: string;
}) {
  const [activeId, setActiveId] = useState(images[0]?.id);
  const active = images.find((image) => image.id === activeId) ?? images[0];

  if (!active) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        Tanpa gambar
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted">
        <Image
          src={active.url}
          alt={active.alt ?? alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveId(image.id)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                image.id === active.id ? "border-primary" : "border-transparent",
              )}
              aria-label={`Lihat gambar ${image.alt ?? alt}`}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="price text-5xl font-bold">Oops</p>
        <h1 className="mt-4 text-2xl font-bold">Terjadi kesalahan</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Halaman ini gagal dimuat. Coba muat ulang, atau kembali ke katalog.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className={buttonVariants()}>
            Coba lagi
          </button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Kembali ke katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
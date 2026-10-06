import type { ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: { href: string; label: string } | null;
  secondaryAction?: { href: string; label: string } | null;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-border/80 bg-card px-6 py-14 text-center ${className}`}
    >
      {icon ? (
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <p className="mt-4 text-base font-semibold">{title}</p>
      {description ? (
        <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </div>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action ? (
            <Link href={action.href} className={buttonVariants()}>
              {action.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className={buttonVariants({ variant: "outline" })}
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function NotFoundState({
  title = "Halaman tidak ditemukan",
  description = "Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.",
  backHref = "/",
  backLabel = "Kembali ke beranda",
  action,
}: {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="price text-6xl font-bold">404</p>
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={backHref} className={buttonVariants()}>
            <Home className="size-4" />
            {backLabel}
          </Link>
          {action ? (
            <Link
              href={action.href}
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft className="size-4" />
              {action.label}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Kami gagal memuat data ini. Coba muat ulang halaman.",
  backHref,
  backLabel = "Kembali",
}: {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={backHref ?? "/"} className={buttonVariants()}>
            <RefreshCw className="size-4" />
            Muat ulang
          </Link>
          {backHref ? (
            <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
              {backLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
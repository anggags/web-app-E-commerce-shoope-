import Link from "next/link";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";

import { requireUserPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { StoreRegistrationForm } from "@/components/seller/store-registration-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Daftar Toko" };

export default async function RegisterStorePage() {
  const user = await requireUserPage();

  if (user.role === "ADMIN") redirect("/admin");

  const existing = await prisma.store.findUnique({
    where: { ownerId: user.id },
    select: { slug: true, status: true },
  });
  if (existing) redirect("/seller");

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store className="size-5" />
          </span>
          <h1 className="text-2xl font-bold">Buka Toko Kamu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gratis. Toko akan diverifikasi admin sebelum produk bisa tayang.
          </p>
        </div>

        <StoreRegistrationForm />

        <p className="text-center text-sm text-muted-foreground">
          Sudah punya toko?{" "}
          <Link href="/" className="text-primary hover:underline">
            Kembali ke katalog
          </Link>
        </p>
      </div>
    </div>
  );
}
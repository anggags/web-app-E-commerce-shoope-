import { redirect } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUserPage } from "@/lib/auth-helpers";
import { getCartSummary } from "@/lib/queries/cart";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUserPage();
  const summary = await getCartSummary(user.id);

  if (summary.lines.length === 0) redirect("/cart");

  const savedAddress = await prisma.address.findFirst({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    select: {
      recipientName: true,
      phone: true,
      province: true,
      city: true,
      district: true,
      postalCode: true,
      street: true,
    },
  });

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Lengkapi alamat dan pilih pembayaran untuk menyelesaikan belanja.
        </p>
      </header>

      {summary.hasUnavailable ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <ShoppingCart className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span className="text-muted-foreground">
            Beberapa item di keranjang tidak tersedia. Perbaiki keranjang sebelum checkout.
          </span>
        </div>
      ) : null}

      <CheckoutForm
        groups={summary.groups}
        grandTotal={summary.grandTotal}
        defaultAddress={savedAddress}
      />

      <p className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <ShoppingCart className="size-4" />
        Setiap toko dipisah menjadi order sendiri agar ongkir dan resi akurat.
      </p>
    </div>
  );
}

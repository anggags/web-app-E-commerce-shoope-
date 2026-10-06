"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { checkoutAction } from "@/lib/actions/checkout";
import type { ActionState } from "@/lib/actions/action-state";
import { formatIDR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { CartStoreGroup } from "@/lib/queries/cart";

const initialState: ActionState = { status: "idle" };

export function CheckoutForm({
  groups,
  grandTotal,
  defaultAddress,
}: {
  groups: CartStoreGroup[];
  grandTotal: number;
  defaultAddress: {
    recipientName: string | null;
    phone: string | null;
    province: string | null;
    city: string | null;
    district: string | null;
    postalCode: string | null;
    street: string | null;
  } | null;
}) {
  const [state, formAction] = useActionState(checkoutAction, initialState);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
          <h2 className="font-semibold">Alamat pengiriman</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nama penerima" name="recipientName" defaultValue={defaultAddress?.recipientName ?? undefined} error={state.fieldErrors?.["address.recipientName"]?.[0]} />
            <Field label="Nomor telepon" name="phone" defaultValue={defaultAddress?.phone ?? undefined} error={state.fieldErrors?.["address.phone"]?.[0]} />
            <Field label="Provinsi" name="province" defaultValue={defaultAddress?.province ?? undefined} error={state.fieldErrors?.["address.province"]?.[0]} />
            <Field label="Kota / Kabupaten" name="city" defaultValue={defaultAddress?.city ?? undefined} error={state.fieldErrors?.["address.city"]?.[0]} />
            <Field label="Kecamatan" name="district" defaultValue={defaultAddress?.district ?? undefined} error={state.fieldErrors?.["address.district"]?.[0]} />
            <Field label="Kode pos" name="postalCode" defaultValue={defaultAddress?.postalCode ?? undefined} error={state.fieldErrors?.["address.postalCode"]?.[0]} />
            <div className="sm:col-span-2">
              <Label htmlFor="street">Alamat lengkap</Label>
              <Textarea
                id="street"
                name="street"
                rows={3}
                defaultValue={defaultAddress?.street ?? undefined}
                className="mt-1"
                placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
              />
              {state.fieldErrors?.["address.street"]?.[0] ? (
                <p className="mt-1 text-xs text-destructive">
                  {state.fieldErrors["address.street"][0]}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
          <h2 className="font-semibold">Metode pembayaran</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mode demo: tidak ada payment gateway. COD langsung diproses seller.
          </p>

          <div className="mt-4">
            <Select name="paymentMethod" defaultValue="COD">
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COD">Bayar di tempat (COD)</SelectItem>
                <SelectItem value="BANK_TRANSFER">Transfer bank (simulasi)</SelectItem>
                <SelectItem value="E_WALLET">E-wallet (simulasi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
          <h2 className="font-semibold">Catatan per toko (opsional)</h2>
          <div className="mt-3 space-y-3">
            {groups.map((group) => (
              <div key={group.store.id}>
                <Label htmlFor={`note-${group.store.id}`} className="text-sm text-muted-foreground">
                  {group.store.name}
                </Label>
                <Textarea
                  id={`note-${group.store.id}`}
                  name={`note:${group.store.id}`}
                  rows={2}
                  className="mt-1"
                  placeholder="Contoh: titip ke satpam"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-border/70 bg-card p-5 shadow-card lg:sticky lg:top-28">
        <h2 className="font-semibold">Ringkasan per toko</h2>

        <ul className="mt-3 space-y-3 text-sm">
          {groups.map((group) => (
            <li key={group.store.id}>
              <p className="font-medium">{group.store.name}</p>
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatIDR(group.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Ongkir</span>
                <span className={group.shippingFee === 0 ? "text-success" : "tabular-nums"}>
                  {group.shippingFee === 0 ? "Gratis" : formatIDR(group.shippingFee)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="price text-lg font-bold">{formatIDR(grandTotal)}</span>
        </div>

        {state.status === "error" ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {state.message}
          </p>
        ) : null}

        {state.status === "success" ? (
          <SuccessMessage message={state.message ?? ""} />
        ) : null}

        <CheckoutButton />
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} className="mt-1" />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  const orderNumbers = message
    .replace("Checkout berhasil. ", "")
    .split(", ")
    .map((value) => value.trim());

  return (
    <div className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm">
      <p className="font-medium text-success">Checkout berhasil</p>
      <ul className="mt-1 space-y-0.5">
        {orderNumbers.map((orderNumber) => (
          <li key={orderNumber}>
            <a href={`/orders/${orderNumber}`} className="underline">
              {orderNumber}
            </a>
          </li>
        ))}
      </ul>
      <Button asChild size="sm" variant="outline" className="mt-2 w-full">
        <Link href="/orders">Lihat semua pesanan</Link>
      </Button>
    </div>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-4 w-full" disabled={pending}>
      {pending ? "Memproses..." : "Buat pesanan"}
    </Button>
  );
}

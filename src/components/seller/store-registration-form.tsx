"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerStoreAction } from "@/lib/actions/store";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { status: "idle" };

export function StoreRegistrationForm() {
  const [state, formAction] = useActionState(registerStoreAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-background p-4">
      <div>
        <Label htmlFor="name">Nama toko</Label>
        <Input id="name" name="name" className="mt-1" placeholder="Toko Sederhana" />
        {state.fieldErrors?.name?.[0] ? (
          <p className="mt-1 text-xs text-destructive">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">Kota asal</Label>
          <Input id="city" name="city" className="mt-1" placeholder="Bandung" />
          {state.fieldErrors?.city?.[0] ? (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.city[0]}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="phone">Nomor WhatsApp</Label>
          <Input id="phone" name="phone" className="mt-1" placeholder="081234567890" />
          {state.fieldErrors?.phone?.[0] ? (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.phone[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="shippingFee">Ongkir tetap (Rp)</Label>
          <Input id="shippingFee" name="shippingFee" defaultValue="15000" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="freeShippingMin">Gratis ongkir minimal (Rp)</Label>
          <Input id="freeShippingMin" name="freeShippingMin" placeholder="200000" className="mt-1" />
        </div>
      </div>

      {state.status === "error" ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {state.message} Refresh halaman atau{" "}
          <a href="/seller" className="underline">
            buka Seller Centre
          </a>
          .
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Membuat toko..." : "Daftar toko"}
    </Button>
  );
}
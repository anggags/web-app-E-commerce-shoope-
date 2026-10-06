"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { saveAddressAction } from "@/lib/actions/address";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = { status: "idle" };

export function AddressForm() {
  const [state, formAction] = useActionState(saveAddressAction, initialState);

  return (
    <form action={formAction} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="label">Label (opsional)</Label>
        <Input id="label" name="label" className="mt-1" placeholder="Rumah, Kantor" />
      </div>
      <div>
        <Label htmlFor="recipientName">Nama penerima</Label>
        <Input id="recipientName" name="recipientName" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="phone">Nomor telepon</Label>
        <Input id="phone" name="phone" className="mt-1" placeholder="081234567890" />
      </div>
      <div>
        <Label htmlFor="postalCode">Kode pos</Label>
        <Input id="postalCode" name="postalCode" inputMode="numeric" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="province">Provinsi</Label>
        <Input id="province" name="province" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="city">Kota / Kabupaten</Label>
        <Input id="city" name="city" className="mt-1" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="district">Kecamatan</Label>
        <Input id="district" name="district" className="mt-1" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="street">Alamat lengkap</Label>
        <Textarea id="street" name="street" rows={2} className="mt-1" />
        {state.fieldErrors?.street?.[0] ? (
          <p className="mt-1 text-xs text-destructive">{state.fieldErrors.street[0]}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="isDefault" className="size-4" />
        Jadikan alamat default
      </label>

      {state.status === "error" ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
          {state.message}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : "Simpan alamat"}
    </Button>
  );
}
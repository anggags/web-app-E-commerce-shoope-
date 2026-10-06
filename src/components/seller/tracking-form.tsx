"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Truck } from "lucide-react";

import { inputTrackingAction } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TrackingState = { status: string; message?: string } | null;

export function TrackingForm({ orderNumber }: { orderNumber: string }) {
  const [state, formAction] = useActionState<TrackingState, FormData>(
    (prev, formData) => inputTrackingAction(orderNumber, prev, formData),
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm font-medium">Input resi pengiriman</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs" htmlFor="courier">
            Kurir
          </Label>
          <Input id="courier" name="courier" placeholder="JNE / SiCepat / Anteraja" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs" htmlFor="trackingNumber">
            Nomor resi
          </Label>
          <Input id="trackingNumber" name="trackingNumber" placeholder="JX123456789" className="mt-1" />
        </div>
      </div>

      {state?.status === "error" ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      {state?.status === "success" ? (
        <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <Truck className="size-4" />
      {pending ? "Menyimpan..." : "Simpan resi"}
    </Button>
  );
}
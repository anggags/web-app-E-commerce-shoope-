"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/address";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type AddressItem = {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string | null;
  postalCode: string | null;
  street: string;
  isDefault: boolean;
};

export function AddressList({ addresses }: { addresses: AddressItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>, message: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(message);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Aksi gagal.");
      }
    });
  }

  if (addresses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Belum ada alamat tersimpan.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {addresses.map((address) => (
        <article key={address.id} className="rounded-xl border p-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium">{address.label ?? "Alamat"}</p>
            {address.isDefault ? <Badge variant="secondary">Default</Badge> : null}
          </div>
          <p className="mt-2 font-medium">{address.recipientName}</p>
          <p className="text-xs text-muted-foreground">{address.phone}</p>
          <address className="mt-1 not-italic text-muted-foreground">
            {address.street}
            <br />
            {address.district ? `${address.district}, ` : ""}
            {address.city}, {address.province} {address.postalCode}
          </address>

          <div className="mt-3 flex gap-2">
            {!address.isDefault ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => run(() => setDefaultAddressAction(address.id), "Alamat default diganti.")}
              >
                <Star className="size-3.5" /> Jadikan default
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              disabled={isPending}
              onClick={() => {
                if (!window.confirm("Hapus alamat ini?")) return;
                run(() => deleteAddressAction(address.id), "Alamat dihapus.");
              }}
            >
              <Trash2 className="size-3.5" /> Hapus
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
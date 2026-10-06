import { requireUserPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AddressList } from "@/components/account/address-list";
import { AddressForm } from "@/components/account/address-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Alamat Tersimpan" };

export default async function AddressesPage() {
  const user = await requireUserPage();

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    select: {
      id: true,
      label: true,
      recipientName: true,
      phone: true,
      province: true,
      city: true,
      district: true,
      postalCode: true,
      street: true,
      isDefault: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Alamat Tersimpan</h1>
        <p className="text-sm text-muted-foreground">
          Alamat ini otomatis terisi saat checkout. Alamat pertama menjadi alamat default.
        </p>
      </div>

      <AddressList addresses={addresses} />

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
        <h2 className="font-semibold">Tambah alamat baru</h2>
        <AddressForm />
      </section>
    </div>
  );
}
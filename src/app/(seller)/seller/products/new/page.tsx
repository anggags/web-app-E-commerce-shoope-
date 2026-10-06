import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ProductForm } from "@/components/seller/product-form";
import { AlertCircle } from "lucide-react";

export const metadata = { title: "Tambah Produk" };

export default function NewProductPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Tambah Produk</h1>
        <p className="text-sm text-muted-foreground">
          Produk baru masuk status &ldquo;Menunggu moderasi&rdquo; sebelum tayang.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <p>
          Pastikan minimal satu gambar, satu varian, dan harga terisi. Baris varian dikirim sebagai
          JSON dari form ini.
        </p>
      </div>

      <ProductForm />

      <Link href="/seller/products" className={buttonVariants({ variant: "outline" })}>
        Kembali ke daftar produk
      </Link>
    </div>
  );
}

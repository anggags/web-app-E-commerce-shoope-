import { NotFoundState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <NotFoundState
      description="Produk atau toko yang kamu cari mungkin sudah dihapus atau belum tayang."
      backHref="/"
      backLabel="Kembali ke katalog"
      action={{ href: "/search", label: "Cari produk" }}
    />
  );
}
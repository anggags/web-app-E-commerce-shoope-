import { getSessionUser } from "@/lib/auth-helpers";
import { getCartSummary } from "@/lib/queries/cart";
import { Navbar } from "@/components/layout/navbar";
import { LocalNav } from "@/components/layout/local-nav";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartStoreSync } from "@/components/cart/cart-store-sync";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  const summary = user ? await getCartSummary(user.id) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <LocalNav />

      <CartStoreSync isAuthenticated={Boolean(user)} lines={summary?.lines ?? []} />
      <CartDrawer isAuthenticated={Boolean(user)} />

      <main className="container-page flex-1 py-6 sm:py-8">{children}</main>

      <Footer />
    </div>
  );
}

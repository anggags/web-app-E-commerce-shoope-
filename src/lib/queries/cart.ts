import { prisma } from "@/lib/prisma";

export type CartLine = {
  cartItemId: string;
  productId: string;
  productSlug: string;
  variantId: string;
  productName: string;
  variantName: string;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  quantity: number;
  subtotal: number;
  store: { id: string; name: string; slug: string };
  isAvailable: boolean;
};

export type CartStoreGroup = {
  store: CartLine["store"];
  lines: CartLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  hasUnavailable: boolean;
};

export async function getCartLines(userId: string): Promise<CartLine[]> {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { id: "asc" },
    select: {
      id: true,
      quantity: true,
      productId: true,
      variantId: true,
      product: {
        select: {
          slug: true,
          name: true,
          status: true,
          images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      variant: { select: { name: true, price: true, compareAtPrice: true, stock: true } },
      store: { select: { id: true, name: true, slug: true, status: true } },
    },
  });

  return items.map((item) => ({
    cartItemId: item.id,
    productId: item.productId,
    productSlug: item.product.slug,
    variantId: item.variantId,
    productName: item.product.name,
    variantName: item.variant.name,
    imageUrl: item.product.images[0]?.url ?? null,
    price: item.variant.price,
    compareAtPrice: item.variant.compareAtPrice,
    stock: item.variant.stock,
    quantity: item.quantity,
    subtotal: item.variant.price * item.quantity,
    store: { id: item.store.id, name: item.store.name, slug: item.store.slug },
    isAvailable:
      item.product.status === "ACTIVE" &&
      item.store.status === "ACTIVE" &&
      item.variant.stock > 0 &&
      item.quantity <= item.variant.stock,
  }));
}

/** Group keranjang per toko + hitung ongkir (pola Shopee). */
export function groupCartByStore(
  lines: CartLine[],
  stores: Record<string, { shippingFee: number; freeShippingMin: number | null }>,
): CartStoreGroup[] {
  const groups = new Map<string, CartLine[]>();

  for (const line of lines) {
    const bucket = groups.get(line.store.id) ?? [];
    bucket.push(line);
    groups.set(line.store.id, bucket);
  }

  return Array.from(groups.entries()).map(([storeId, storeLines]) => {
    const subtotal = storeLines.reduce((sum, line) => sum + line.subtotal, 0);
    const config = stores[storeId];
    const freeShipping = config?.freeShippingMin != null && subtotal >= config.freeShippingMin;
    const shippingFee = freeShipping || subtotal === 0 ? 0 : (config?.shippingFee ?? 0);

    return {
      store: storeLines[0].store,
      lines: storeLines,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      hasUnavailable: storeLines.some((line) => !line.isAvailable),
    };
  });
}

export async function getStoreShippingConfig(storeIds: string[]) {
  if (storeIds.length === 0) return {};

  const stores = await prisma.store.findMany({
    where: { id: { in: storeIds } },
    select: { id: true, shippingFee: true, freeShippingMin: true },
  });

  return Object.fromEntries(
    stores.map((store) => [store.id, { shippingFee: store.shippingFee, freeShippingMin: store.freeShippingMin }]),
  );
}

export async function getCartSummary(userId: string) {
  const lines = await getCartLines(userId);
  const shippingConfig = await getStoreShippingConfig([
    ...new Set(lines.map((line) => line.store.id)),
  ]);
  const groups = groupCartByStore(lines, shippingConfig);

  return {
    lines,
    groups,
    totalItems: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: groups.reduce((sum, group) => sum + group.subtotal, 0),
    shippingFee: groups.reduce((sum, group) => sum + group.shippingFee, 0),
    grandTotal: groups.reduce((sum, group) => sum + group.total, 0),
    hasUnavailable: groups.some((group) => group.hasUnavailable),
  };
}

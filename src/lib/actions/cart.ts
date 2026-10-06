"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { HttpError, requireUser } from "@/lib/auth-helpers";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validations/order";
import { getCartSummary } from "@/lib/queries/cart";

export async function addToCartAction(variantId: string, quantity: number) {
  const user = await requireUser();
  const parsed = addToCartSchema.parse({ variantId, quantity });

  const variant = await prisma.productVariant.findUnique({
    where: { id: parsed.variantId },
    select: {
      id: true,
      price: true,
      stock: true,
      isActive: true,
      product: { select: { id: true, status: true, store: { select: { id: true, status: true } } } },
    },
  });

  if (!variant || !variant.isActive) throw new HttpError(404, "Varian tidak ditemukan.");
  if (variant.product.status !== "ACTIVE" || variant.product.store.status !== "ACTIVE") {
    throw new HttpError(400, "Produk tidak tersedia.");
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_variantId: { userId: user.id, variantId: variant.id } },
    select: { id: true, quantity: true },
  });

  const nextQuantity = (existing?.quantity ?? 0) + parsed.quantity;
  if (nextQuantity > variant.stock) {
    throw new HttpError(400, `Stok tersisa ${variant.stock}.`);
  }

  await prisma.cartItem.upsert({
    where: { userId_variantId: { userId: user.id, variantId: variant.id } },
    create: {
      userId: user.id,
      productId: variant.product.id,
      variantId: variant.id,
      storeId: variant.product.store.id,
      quantity: parsed.quantity,
    },
    update: { quantity: nextQuantity },
  });

  revalidatePath("/cart");
  return getCartSummary(user.id);
}

export async function updateCartItemAction(cartItemId: string, quantity: number) {
  const user = await requireUser();
  const parsed = updateCartItemSchema.parse({ cartItemId, quantity });

  const item = await prisma.cartItem.findFirst({
    where: { id: parsed.cartItemId, userId: user.id },
    select: { id: true, quantity: true, variant: { select: { stock: true } } },
  });

  if (!item) throw new HttpError(404, "Item keranjang tidak ditemukan.");

  if (parsed.quantity === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    if (parsed.quantity > item.variant.stock) {
      throw new HttpError(400, `Stok tersisa ${item.variant.stock}.`);
    }
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: parsed.quantity } });
  }

  revalidatePath("/cart");
  return getCartSummary(user.id);
}

export async function removeCartItemAction(cartItemId: string) {
  const user = await requireUser();
  await prisma.cartItem.deleteMany({ where: { id: cartItemId, userId: user.id } });
  revalidatePath("/cart");
  return getCartSummary(user.id);
}

export async function clearCartAction() {
  const user = await requireUser();
  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  revalidatePath("/cart");
  return getCartSummary(user.id);
}

import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/auth-helpers";
import { generateOrderNumber } from "@/lib/order-number";
import { getCartLines, getStoreShippingConfig, groupCartByStore } from "@/lib/queries/cart";
import type { CheckoutInput } from "@/lib/validations/order";

/**
 * Checkout multi-seller: keranjang dipecah per toko, setiap toko menghasilkan
 * 1 Order (pola Shopee) dengan ongkir sendiri. Stok dikunci lewat
 * `updateMany` bersyarat supaya aman terhadap overselling.
 */
export async function checkout(userId: string, input: CheckoutInput) {
  const lines = await getCartLines(userId);

  if (lines.length === 0) throw new HttpError(400, "Keranjang masih kosong.");

  const unavailable = lines.filter((line) => !line.isAvailable);
  if (unavailable.length > 0) {
    const names = unavailable.map((line) => line.productName).join(", ");
    throw new HttpError(400, `Stok atau produk tidak tersedia lagi: ${names}`);
  }

  const storeIds = [...new Set(lines.map((line) => line.store.id))];
  const groups = groupCartByStore(lines, await getStoreShippingConfig(storeIds));

  const address = await prisma.address.create({
    data: {
      userId,
      label: input.address.label ?? null,
      recipientName: input.address.recipientName,
      phone: input.address.phone,
      province: input.address.province,
      city: input.address.city,
      district: input.address.district ?? null,
      postalCode: input.address.postalCode,
      street: input.address.street,
    },
  });

  const addressSnapshot = JSON.stringify({
    recipientName: address.recipientName,
    phone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district,
    postalCode: address.postalCode,
    street: address.street,
  });

  const isCod = input.paymentMethod === "COD";
  const createdOrders: { orderNumber: string; total: number }[] = [];

  for (const group of groups) {
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const line of group.lines) {
        const locked = await tx.productVariant.updateMany({
          where: { id: line.variantId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });

        if (locked.count === 0) {
          throw new HttpError(409, `Stok ${line.productName} tidak mencukupi.`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          storeId: group.store.id,
          status: isCod ? "PROCESSING" : "AWAITING_PAYMENT",
          paymentStatus: isCod ? "PAID" : "UNPAID",
          paymentMethod: input.paymentMethod,
          paidAt: isCod ? new Date() : null,
          subtotal: group.subtotal,
          shippingFee: group.shippingFee,
          total: group.total,
          buyerNote: input.notesPerStore[group.store.id] ?? null,
          recipientName: address.recipientName,
          shippingPhone: address.phone,
          shippingAddress: addressSnapshot,
        },
        select: { id: true, orderNumber: true, total: true },
      });

      for (const line of group.lines) {
        await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: line.productId,
            variantId: line.variantId,
            storeId: group.store.id,
            productName: line.productName,
            variantName: line.variantName,
            imageUrl: line.imageUrl,
            price: line.price,
            quantity: line.quantity,
            subtotal: line.subtotal,
          },
        });

        await tx.product.update({
          where: { id: line.productId },
          data: { soldCount: { increment: line.quantity } },
        });
      }

      return created;
    });

    createdOrders.push({ orderNumber: order.orderNumber, total: order.total });
  }

  await prisma.cartItem.deleteMany({ where: { userId } });

  return createdOrders;
}

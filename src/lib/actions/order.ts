"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { HttpError, requireSeller } from "@/lib/auth-helpers";
import { orderStatusUpdateSchema, shippingUpdateSchema } from "@/lib/validations/order";
import type { OrderStatus } from "@/generated/prisma/enums";

const SELLER_TRANSITIONS: Record<string, OrderStatus[]> = {
  PAID: ["PROCESSING", "SHIPPED", "CANCELED"],
  PROCESSING: ["SHIPPED", "CANCELED"],
  SHIPPED: ["COMPLETED"],
};

/** Seller mengubah status order miliknya. */
export async function updateOrderStatusAction(orderId: string, nextStatus: string) {
  const { store } = await requireSeller();
  const parsed = orderStatusUpdateSchema.parse({ status: nextStatus });

  const order = await prisma.order.findFirst({
    where: { id: orderId, storeId: store.id },
    select: { id: true, status: true, orderNumber: true },
  });

  if (!order) throw new HttpError(404, "Order tidak ditemukan.");

  const allowed = SELLER_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(parsed.status)) {
    throw new HttpError(400, `Order ${order.orderNumber} tidak bisa diubah ke status tersebut.`);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: parsed.status,
      cancelReason: parsed.status === "CANCELED" ? (parsed.cancelReason ?? "Dibatalkan seller") : null,
      canceledAt: parsed.status === "CANCELED" ? new Date() : null,
      deliveredAt: parsed.status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${order.orderNumber}`);
}

export async function inputTrackingAction(
  orderNumber: string,
  _prev: { status: string; message?: string } | null,
  formData: FormData,
) {
  const { store } = await requireSeller();
  const parsed = shippingUpdateSchema.safeParse({
    courier: formData.get("courier"),
    trackingNumber: formData.get("trackingNumber"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Data resi tidak valid." };
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, storeId: store.id },
    select: { id: true, status: true },
  });

  if (!order) return { status: "error", message: "Order tidak ditemukan." };
  if (!["PAID", "PROCESSING"].includes(order.status)) {
    return { status: "error", message: "Resi hanya bisa diinput untuk order yang sedang diproses." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      courier: parsed.data.courier,
      trackingNumber: parsed.data.trackingNumber,
      status: "SHIPPED",
      shippedAt: new Date(),
    },
  });

  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderNumber}`);

  return { status: "success", message: "Resi tersimpan dan order berstatus dikirim." };
}

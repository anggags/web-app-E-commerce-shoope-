"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { HttpError, requireUser } from "@/lib/auth-helpers";

const reviewSchema = z.object({
  orderItemId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type ReviewState = { status: "idle" | "error" | "success"; message?: string };

export async function submitReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse({
    orderItemId: formData.get("orderItemId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Rating tidak valid." };
  }

  const orderItem = await prisma.orderItem.findFirst({
    where: { id: parsed.data.orderItemId, order: { userId: user.id } },
    select: { id: true, productId: true },
  });

  if (!orderItem) throw new HttpError(404, "Item pesanan tidak ditemukan.");

  const existing = await prisma.review.findUnique({
    where: { orderItemId: orderItem.id },
    select: { id: true },
  });

  if (existing) return { status: "error", message: "Anda sudah ulasan produk ini." };

  await prisma.review.create({
    data: {
      orderItemId: orderItem.id,
      productId: orderItem.productId,
      userId: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
      status: "PENDING",
    },
  });

  revalidatePath("/orders");
  return { status: "success", message: "Ulasan terkirim, menunggu moderasi." };
}

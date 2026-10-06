"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { HttpError, requireAdmin } from "@/lib/auth-helpers";

export async function moderateProductAction(productId: string, action: "approve" | "reject") {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, status: true },
  });

  if (!product) throw new HttpError(404, "Produk tidak ditemukan.");
  if (action === "approve") {
    await prisma.product.update({
      where: { id: productId },
      data: { status: "ACTIVE", publishedAt: new Date() },
    });
  } else {
    await prisma.product.update({ where: { id: productId }, data: { status: "REJECTED" } });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function setUserBannedAction(userId: string, banned: boolean) {
  const admin = await requireAdmin();
  if (admin.id === userId) throw new HttpError(400, "Tidak bisa memblokir akun sendiri.");

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: banned, bannedAt: banned ? new Date() : null },
  });

  revalidatePath("/admin/users");
}

export async function setUserRoleAction(userId: string, role: "BUYER" | "SELLER" | "ADMIN") {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function setStoreStatusAction(
  storeId: string,
  status: "PENDING" | "ACTIVE" | "SUSPENDED",
) {
  await requireAdmin();
  await prisma.store.update({ where: { id: storeId }, data: { status } });
  revalidatePath("/admin/stores");
  revalidatePath("/");
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { HttpError, requireUser } from "@/lib/auth-helpers";
import { createUniqueSlug } from "@/lib/slug";
import { storeRegistrationSchema } from "@/lib/validations/auth";
import type { ActionState } from "@/lib/actions/action-state";

/** Seller membuat toko. Toko baru berstatus PENDING sampai disetujui admin. */
export async function registerStoreAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    return { status: "error", message: "Admin tidak perlu membuat toko." };
  }

  const existing = await prisma.store.findUnique({
    where: { ownerId: user.id },
    select: { id: true, slug: true },
  });
  if (existing) {
    return { status: "error", message: "Akun kamu sudah memiliki toko." };
  }

  const parsed = storeRegistrationSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    phone: formData.get("phone"),
    shippingFee: formData.get("shippingFee") || 0,
    freeShippingMin: formData.get("freeShippingMin") || null,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Data toko tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  await prisma.user.update({ where: { id: user.id }, data: { role: "SELLER" } });

  await prisma.store.create({
    data: {
      ownerId: user.id,
      name: input.name,
      slug: await createUniqueSlug("store", input.name),
      city: input.city,
      phone: input.phone,
      shippingFee: input.shippingFee,
      freeShippingMin: input.freeShippingMin,
      status: "PENDING",
    },
  });

  revalidatePath("/seller");
  revalidatePath("/");
  return { status: "success", message: "Toko dibuat dan menunggu persetujuan admin." };
}

export async function updateStoreSettingsAction(
  storeId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
    select: { id: true },
  });
  if (!store) throw new HttpError(404, "Toko tidak ditemukan.");

  const parsed = z
    .object({
      city: z.string().trim().max(60).optional(),
      phone: z.string().trim().max(24).optional(),
      shippingFee: z.coerce.number().int().min(0).max(1_000_000),
      freeShippingMin: z.coerce.number().int().min(0).nullable().optional(),
    })
    .safeParse({
      city: formData.get("city") || undefined,
      phone: formData.get("phone") || undefined,
      shippingFee: formData.get("shippingFee") || 0,
      freeShippingMin: formData.get("freeShippingMin") || null,
    });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  await prisma.store.update({
    where: { id: store.id },
    data: {
      city: parsed.data.city ?? null,
      phone: parsed.data.phone ?? null,
      shippingFee: parsed.data.shippingFee,
      freeShippingMin: parsed.data.freeShippingMin ?? null,
    },
  });

  revalidatePath("/seller");
  revalidatePath(`/stores/${storeId}`);
  return { status: "success", message: "Pengaturan toko disimpan." };
}
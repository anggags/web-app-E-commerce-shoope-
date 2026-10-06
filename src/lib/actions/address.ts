"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { HttpError, requireUser } from "@/lib/auth-helpers";
import { addressSchema } from "@/lib/validations/order";
import type { ActionState } from "@/lib/actions/action-state";

export async function saveAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = addressSchema.safeParse({
    recipientName: formData.get("recipientName"),
    phone: formData.get("phone"),
    province: formData.get("province"),
    city: formData.get("city"),
    district: formData.get("district") || null,
    postalCode: formData.get("postalCode") || null,
    street: formData.get("street"),
    label: formData.get("label") || null,
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Alamat tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const count = await prisma.address.count({ where: { userId: user.id } });
  const isFirst = count === 0;

  await prisma.$transaction(async (tx) => {
    if (input.isDefault || isFirst) {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }

    await tx.address.create({
      data: {
        userId: user.id,
        recipientName: input.recipientName,
        phone: input.phone,
        province: input.province,
        city: input.city,
        district: input.district ?? null,
        postalCode: input.postalCode ?? null,
        street: input.street,
        label: input.label ?? null,
        isDefault: input.isDefault || isFirst,
      },
    });
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");

  return { status: "success", message: "Alamat disimpan." };
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser();

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { id: true, isDefault: true },
  });
  if (!address) throw new HttpError(404, "Alamat tidak ditemukan.");

  await prisma.address.delete({ where: { id: address.id } });

  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: { id: "asc" },
      select: { id: true },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function setDefaultAddressAction(addressId: string) {
  const user = await requireUser();

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { id: true },
  });
  if (!address) throw new HttpError(404, "Alamat tidak ditemukan.");

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: address.id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}
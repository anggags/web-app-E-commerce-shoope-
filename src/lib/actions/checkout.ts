"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import { checkout } from "@/lib/services/checkout";
import { checkoutSchema } from "@/lib/validations/order";
import type { ActionState } from "@/lib/actions/action-state";

export async function checkoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const notesPerStore: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("note:") && typeof value === "string" && value.trim()) {
      notesPerStore[key.slice("note:".length)] = value.trim();
    }
  }

  const parsed = checkoutSchema.safeParse({
    address: {
      recipientName: formData.get("recipientName"),
      phone: formData.get("phone"),
      province: formData.get("province"),
      city: formData.get("city"),
      district: formData.get("district") || undefined,
      postalCode: formData.get("postalCode"),
      street: formData.get("street"),
      label: formData.get("label") || undefined,
    },
    paymentMethod: formData.get("paymentMethod") ?? "COD",
    notesPerStore,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Alamat pengiriman tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const orders = await checkout(user.id, parsed.data);
    revalidatePath("/cart");
    revalidatePath("/orders");

    return {
      status: "success",
      message: `Checkout berhasil. ${orders.length} order dibuat: ${orders
        .map((order) => order.orderNumber)
        .join(", ")}`,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Checkout gagal. Coba lagi.",
    };
  }
}

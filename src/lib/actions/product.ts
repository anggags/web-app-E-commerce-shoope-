"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { HttpError, requireSeller } from "@/lib/auth-helpers";
import { createUniqueSlug } from "@/lib/slug";
import { productSchema } from "@/lib/validations/product";
import type { ProductInput } from "@/lib/validations/product";
import type { ActionState } from "@/lib/actions/action-state";

function parseProductForm(formData: FormData) {
  const optionNames = formData
    .getAll("optionName")
    .map((name) => String(name).trim())
    .filter(Boolean);

  const options = optionNames.map((name) => ({
    name,
    values: String(formData.get(`option:${name}`) ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  }));

  const variants = formData
    .getAll("variant")
    .map((raw) => {
      if (typeof raw !== "string") return null;
      try {
        return JSON.parse(raw) as Record<string, string>;
      } catch {
        return null;
      }
    })
    .filter((value): value is Record<string, string> => value !== null)
    .map((variant) => ({
      ...variant,
      options: parseVariantOptions(variant.options),
    }));

  return {
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category") || undefined,
    images: String(formData.get("images") ?? "")
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url })),
    options,
    variants,
  };
}

/** Varian menyimpan options sebagai object name -> value (JSON di database). */
function parseVariantOptions(raw: string | Record<string, string> | undefined) {
  if (!raw) return {} as Record<string, string>;

  if (typeof raw !== "string") {
    return Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [key, String(value ?? "")]),
    );
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
          key,
          String(value ?? ""),
        ]),
      );
    }
  } catch {
    return {};
  }

  return {};
}

async function syncProductContent(
  productId: string,
  input: ProductInput,
  storeId: string,
) {
  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId } });
    await tx.productVariant.deleteMany({ where: { productId } });

    await tx.productImage.createMany({
      data: input.images.map((image, index) => ({
        productId,
        url: image.url,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });

    await tx.productVariant.createMany({
      data: input.variants.map((variant) => ({
        productId,
        sku: variant.sku,
        name: variant.name,
        options: variant.options,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice ?? null,
        stock: variant.stock,
        weightGrams: variant.weightGrams ?? null,
        isActive: variant.isActive,
      })),
    });

    const basePrice = Math.min(...input.variants.map((variant) => variant.price));

    await tx.product.update({
      where: { id: productId },
      data: {
        name: input.name,
        description: input.description,
        category: input.category ?? null,
        basePrice,
        options: input.options.map((option) => option.name),
        store: { connect: { id: storeId } },
      },
    });
  });
}

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { store } = await requireSeller();

  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Data produk tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const product = await prisma.product.create({
    data: {
      storeId: store.id,
      slug: await createUniqueSlug("product", input.name),
      name: input.name,
      description: input.description,
      category: input.category ?? null,
      basePrice: Math.min(...input.variants.map((variant) => variant.price)),
      options: input.options.map((option) => option.name),
      status: "PENDING_REVIEW",
    },
    select: { id: true, slug: true },
  });

  await syncProductContent(product.id, input, store.id);
  revalidatePath("/seller/products");

  return {
    status: "success",
    message: `Produk "${input.name}" tersimpan dan menunggu moderasi admin.`,
  };
}

export async function updateProductAction(
  productId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { store } = await requireSeller();

  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id },
    select: { id: true },
  });
  if (!existing) throw new HttpError(404, "Produk tidak ditemukan.");

  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Data produk tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await syncProductContent(existing.id, parsed.data, store.id);
  revalidatePath("/seller/products");
  revalidatePath(`/products/${(await prisma.product.findUniqueOrThrow({ where: { id: existing.id }, select: { slug: true } })).slug}`);

  return { status: "success", message: "Perubahan produk disimpan (menunggu moderasi)." };
}

export async function submitProductForReviewAction(productId: string) {
  const { store } = await requireSeller();

  const updated = await prisma.product.updateMany({
    where: { id: productId, storeId: store.id, status: { in: ["DRAFT", "REJECTED"] } },
    data: { status: "PENDING_REVIEW" },
  });

  if (updated.count === 0) {
    throw new HttpError(400, "Produk tidak bisa dikirim untuk moderasi pada status saat ini.");
  }

  revalidatePath("/seller/products");
}

export async function archiveProductAction(productId: string) {
  const { store } = await requireSeller();

  await prisma.product.updateMany({
    where: { id: productId, storeId: store.id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/seller/products");
}

import { z } from "zod";

export const variantSchema = z.object({
  sku: z.string().trim().min(3, "SKU minimal 3 karakter").max(60),
  name: z.string().trim().min(1, "Nama varian wajib diisi").max(120),
  price: z.coerce.number().int().min(0, "Harga tidak boleh negatif"),
  compareAtPrice: z.coerce.number().int().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  weightGrams: z.coerce.number().int().min(0).nullable().optional(),
  isActive: z.coerce.boolean().default(true),
  options: z.record(z.string(), z.string()).default({}),
});

const productOptionsSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1, "Nama opsi wajib diisi").max(40),
      values: z
        .array(z.string().trim().min(1, "Nilai opsi tidak boleh kosong"))
        .min(1, "Minimal satu nilai untuk tiap opsi"),
    }),
  )
  .max(3, "Maksimal 3 opsi variasi")
  .default([]);

export const productSchema = z.object({
  name: z.string().trim().min(5, "Nama produk minimal 5 karakter").max(120),
  description: z.string().trim().min(20, "Deskripsi minimal 20 karakter"),
  category: z.string().trim().max(40).optional(),
  options: productOptionsSchema,
  images: z
    .array(z.object({ url: z.string().trim().min(1, "URL gambar tidak valid") }))
    .min(1, "Minimal satu gambar produk"),
  variants: z.array(variantSchema).min(1, "Minimal satu varian"),
});

export const productUpdateSchema = productSchema.partial();

export const moderationSchema = z.object({
  productId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(300).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;

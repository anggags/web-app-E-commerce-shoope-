import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().min(1, "Pilih variasi produk"),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(99),
});

export const addressSchema = z.object({
  recipientName: z.string().trim().min(3, "Nama penerima minimal 3 karakter"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, "Nomor telepon tidak valid"),
  province: z.string().trim().min(2, "Provinsi wajib diisi"),
  city: z.string().trim().min(2, "Kota wajib diisi"),
  district: z.string().trim().max(60).optional(),
  postalCode: z.string().trim().regex(/^[0-9]{5}$/, "Kode pos harus 5 digit"),
  street: z.string().trim().min(10, "Alamat lengkap minimal 10 karakter"),
  label: z.string().trim().max(30).optional(),
  isDefault: z.coerce.boolean().default(false),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "E_WALLET"]).default("COD"),
  notesPerStore: z.record(z.string(), z.string().max(200)).default({}),
});

export const shippingUpdateSchema = z.object({
  courier: z.string().trim().min(2, "Nama kurir wajib diisi").max(40),
  trackingNumber: z.string().trim().min(4, "Nomor resi minimal 4 karakter").max(60),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "COMPLETED",
    "CANCELED",
  ]),
  cancelReason: z.string().trim().max(200).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

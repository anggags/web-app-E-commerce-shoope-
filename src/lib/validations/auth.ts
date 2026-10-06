import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Nama minimal 3 karakter").max(60),
    email: z.email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
      .regex(/[0-9]/, "Password harus mengandung angka"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const storeRegistrationSchema = z.object({
  name: z.string().trim().min(3, "Nama toko minimal 3 karakter").max(60),
  city: z.string().trim().min(3, "Kota wajib diisi").max(60),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon minimal 8 digit")
    .max(24)
    .regex(/^[0-9+\-\s()]+$/, "Nomor telepon tidak valid"),
  shippingFee: z.coerce.number().int().min(0).max(1_000_000).default(15000),
  freeShippingMin: z.coerce.number().int().min(0).nullable().optional(),
});

export type StoreRegistrationInput = z.infer<typeof storeRegistrationSchema>;

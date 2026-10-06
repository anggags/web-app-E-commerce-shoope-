"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import type { ActionState } from "@/lib/actions/action-state";

/** Hanya izinkan redirect internal (mencegah open redirect). `null` = tidak ditentukan. */
function sanitizeCallbackUrl(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value : "";
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

/** Admin diarahkan ke dashboard admin, seller ke Seller Centre. */
function defaultLandingForRole(role: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/seller";
  return "/";
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Data pendaftaran tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (existing) {
    return { status: "error", message: "Email ini sudah terdaftar. Silakan login." };
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
    select: { role: true },
  });

  const callbackUrl = sanitizeCallbackUrl(formData.get("callbackUrl"));
  const target = await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirectTo: callbackUrl ?? "/",
    redirect: false,
  });

  redirect(target || callbackUrl || defaultLandingForRole(user.role));
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = sanitizeCallbackUrl(formData.get("callbackUrl"));

  if (!email || !password) {
    return { status: "error", message: "Email dan password wajib diisi." };
  }

  let target: string;
  try {
    // `redirect: false` mencegah signIn() melempar NEXT_REDIRECT di dalam
    // Server Action, yang akan tertangkap catch di bawah.
    target = await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl ?? "/",
      redirect: false,
    });
  } catch (error) {
    // AuthError CredentialsSignin tidak menyimpan teks "CredentialsSignin" di
    // `message` (hanya di `type`/`name`), jadi keduanya harus diperiksa.
    const err = error as { type?: string; name?: string };
    const isCredentialError =
      err.type === "CredentialsSignin" || err.name === "CredentialsSignin";

    if (!isCredentialError) {
      return { status: "error", message: "Gagal login. Coba lagi." };
    }

    // Pesan khusus akun nonaktif perlu dicek terpisah karena Auth.js
    // menyembunyikan alasan kegagalan di balik CredentialsSignin.
    const banned = await prisma.user
      .findUnique({ where: { email }, select: { isBanned: true } })
      .then((row) => row?.isBanned ?? false)
      .catch(() => false);

    return {
      status: "error",
      message: banned
        ? "Akun Anda dinonaktifkan. Hubungi admin."
        : "Email atau password salah.",
    };
  }

  if (callbackUrl) {
    redirect(target || callbackUrl);
  }

  const identity = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  redirect(defaultLandingForRole(identity?.role ?? "BUYER"));
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

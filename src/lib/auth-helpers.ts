import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export type SessionUser = {
  id: string;
  role: Role;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/** User dari session JWT, atau `null` bila belum login. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

/** Guard untuk Server Action / route handler. Melempar 401/403. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new HttpError(401, "Anda harus login terlebih dahulu.");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new HttpError(403, "Akses khusus admin.");
  return user;
}

export type SellerContext = {
  user: SessionUser;
  store: {
    id: string;
    name: string;
    slug: string;
    status: "PENDING" | "ACTIVE" | "SUSPENDED";
    shippingFee: number;
    freeShippingMin: number | null;
  };
};

/** Guard untuk Seller Centre: user harus punya toko yang tidak ditangguhkan. */
export async function requireSeller(): Promise<SellerContext> {
  const user = await requireUser();

  const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
  if (!store) throw new HttpError(403, "Anda belum memiliki toko.");
  if (store.status === "SUSPENDED") {
    throw new HttpError(403, "Toko Anda sedang ditangguhkan admin.");
  }

  return {
    user,
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      status: store.status,
      shippingFee: store.shippingFee,
      freeShippingMin: store.freeShippingMin,
    },
  };
}

/** Guard untuk halaman: redirect ke /sign-in bila belum login. */
export async function requireUserPage(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireRolePage(role: Role): Promise<SessionUser> {
  const user = await requireUserPage();
  if (user.role !== role) redirect("/");
  return user;
}

export async function requireAdminPage(): Promise<SessionUser> {
  return requireRolePage("ADMIN");
}

export async function requireSellerPage(): Promise<SellerContext> {
  const user = await requireUserPage();
  const store = await prisma.store.findUnique({ where: { ownerId: user.id } });

  if (!store) redirect("/seller/register-store");
  if (store.status === "SUSPENDED") redirect("/seller?error=suspended");

  return {
    user,
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      status: store.status,
      shippingFee: store.shippingFee,
      freeShippingMin: store.freeShippingMin,
    },
  };
}

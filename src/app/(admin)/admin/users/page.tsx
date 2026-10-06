import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/money";
import { AdminUserRowActions } from "@/components/admin/admin-user-row-actions";
import type { Role } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pengguna" };

const ROLE_STYLE: Record<Role, string> = {
  BUYER: "bg-muted text-muted-foreground",
  SELLER: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  ADMIN: "bg-primary/15 text-primary",
};

export default async function AdminUsersPage() {
  const admin = await requireAdminPage();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Pengguna</h1>
        <p className="text-sm text-muted-foreground">
          {formatNumber(users.length)} pengguna terbaru. Ubah role atau blokir akun bermasalah.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Pengguna</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLE[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">{formatNumber(user._count.orders)}</td>
                <td className="px-4 py-3">
                  {user.isBanned ? (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      Diblokir
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Aktif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminUserRowActions
                    userId={user.id}
                    role={user.role}
                    isBanned={user.isBanned}
                    isSelf={user.id === admin.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
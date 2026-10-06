"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setUserBannedAction, setUserRoleAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import type { Role } from "@/generated/prisma/enums";

export function AdminUserRowActions({
  userId,
  role,
  isBanned,
  isSelf,
}: {
  userId: string;
  role: Role;
  isBanned: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>, message: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(message);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Aksi gagal.");
      }
    });
  }

  if (isSelf) return <span className="text-xs text-muted-foreground">Akun Anda</span>;

  const nextRole: Role = role === "BUYER" ? "SELLER" : "BUYER";

  return (
    <div className="flex justify-end gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          run(
            () => setUserRoleAction(userId, nextRole),
            `Role diubah menjadi ${nextRole}.`,
          )
        }
      >
        Jadikan {nextRole}
      </Button>
      <Button
        size="sm"
        variant={isBanned ? "outline" : "destructive"}
        disabled={isPending}
        onClick={() =>
          run(
            () => setUserBannedAction(userId, !isBanned),
            isBanned ? "Akun dibuka." : "Akun diblokir.",
          )
        }
      >
        {isBanned ? "Buka blokir" : "Blokir"}
      </Button>
    </div>
  );
}
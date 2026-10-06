import Link from "next/link";
import { LogOut, Package, ShieldCheck, Store, UserRound } from "lucide-react";

import { signOutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Pembeli",
  SELLER: "Seller",
  ADMIN: "Admin",
};

export function UserMenu({ user }: { user: SessionUser }) {
  const initials = (user.name ?? user.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu akun">
          <Avatar className="size-8">
            {user.image ? <AvatarImage src={user.image} alt={user.name ?? "Avatar"} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{user.name ?? user.email}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {ROLE_LABEL[user.role] ?? user.role}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/orders">
            <Package className="size-4" /> Pesanan saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/addresses">
            <UserRound className="size-4" /> Alamat pengiriman
          </Link>
        </DropdownMenuItem>
        {user.role === "SELLER" || user.role === "ADMIN" ? (
          <DropdownMenuItem asChild>
            <Link href="/seller">
              <Store className="size-4" /> Seller Centre
            </Link>
          </DropdownMenuItem>
        ) : null}
        {user.role === "ADMIN" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck className="size-4" /> Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant="destructive">
          <form action={signOutAction}>
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="size-4" /> Keluar
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AnonymousMenu() {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">Masuk</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/register">Daftar</Link>
      </Button>
    </div>
  );
}

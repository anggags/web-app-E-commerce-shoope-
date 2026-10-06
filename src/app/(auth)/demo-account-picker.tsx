"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  ShoppingBag,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { loginAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEMO_PASSWORD = "Password123!";

const ACCOUNTS: {
  email: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    email: "buyer@demo.test",
    label: "Pembeli",
    description: "Belanja dan lacak pesanan",
    icon: ShoppingBag,
  },
  {
    email: "seller@demo.test",
    label: "Seller",
    description: "Kelola produk dan pesanan",
    icon: Store,
  },
  {
    email: "admin@demo.test",
    label: "Admin",
    description: "Moderasi produk dan pengguna",
    icon: UserRound,
  },
];

const initialState: ActionState = { status: "idle" };

/** Login cepat untuk demo: pilih peran, isi password, submit. */
export function DemoAccountPicker({ callbackUrl }: { callbackUrl?: string }) {
  const [selected, setSelected] = useState(ACCOUNTS[0].email);
  const [open, setOpen] = useState(false);
  const active = ACCOUNTS.find((account) => account.email === selected) ?? ACCOUNTS[0];

  return (
    <details
      open={open}
      onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
      className="group rounded-2xl border border-dashed border-primary/25 bg-accent/40"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <KeyRound className="size-4 text-primary" />
        Masuk cepat dengan akun demo
        <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-4 border-t border-primary/15 px-4 pb-4 pt-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {ACCOUNTS.map((account) => {
            const Icon = account.icon;
            const isActive = selected === account.email;

            return (
              <button
                key={account.email}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelected(account.email)}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                  isActive
                    ? "border-primary bg-background shadow-sm"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "text-primary" : ""}`} />
                <span className={`text-sm font-semibold ${isActive ? "text-foreground" : ""}`}>
                  {account.label}
                </span>
                <span className="text-[11px] leading-tight">{account.description}</span>
              </button>
            );
          })}
        </div>

        <DemoLoginForm email={selected} callbackUrl={callbackUrl} />

        <p className="text-center text-[11px] text-muted-foreground">
          Password akun demo:{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono">{DEMO_PASSWORD}</code>
          <span className="mt-1 block">{active.email}</span>
        </p>
      </div>
    </details>
  );
}

function DemoLoginForm({ email, callbackUrl }: { email: string; callbackUrl?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="email" value={email} />
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}

      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label htmlFor={`demo-password-${email}`} className="text-xs text-muted-foreground">
            Password
          </Label>
          <PasswordField id={`demo-password-${email}`} defaultValue={DEMO_PASSWORD} />
        </div>

        <DemoSubmitButton />
      </div>

      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function PasswordField({ id, defaultValue }: { id: string; defaultValue: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name="password"
        type={visible ? "text" : "password"}
        defaultValue={defaultValue}
        required
        className="h-10 pr-9 font-mono text-xs"
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function DemoSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" className="h-10 px-4" disabled={pending}>
      {pending ? "Memproses..." : "Masuk"}
    </Button>
  );
}
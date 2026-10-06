"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { status: "idle" };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Buat akun</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <Field
          label="Nama lengkap"
          name="name"
          autoComplete="name"
          error={state.fieldErrors?.name?.[0]}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={state.fieldErrors?.email?.[0]}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={state.fieldErrors?.password?.[0]}
        />
        <Field
          label="Ulangi password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword?.[0]}
        />

        {state.status === "error" ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.message}
          </p>
        ) : null}

        <SubmitButton />
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="mt-1"
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Membuat akun..." : "Daftar"}
    </Button>
  );
}

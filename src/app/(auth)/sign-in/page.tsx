import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun ANGGA PART untuk mulai belanja.",
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const raw = typeof params.callbackUrl === "string" ? params.callbackUrl : "";
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;

  const user = await getSessionUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : user.role === "SELLER" ? "/seller" : "/");
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <LoginForm callbackUrl={callbackUrl} />
      </CardContent>
    </Card>
  );
}
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED: { prefix: string; roles: string[] }[] = [
  { prefix: "/seller/register-store", roles: ["BUYER", "SELLER", "ADMIN"] },
  { prefix: "/seller", roles: ["SELLER", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/checkout", roles: ["BUYER", "SELLER", "ADMIN"] },
  { prefix: "/orders", roles: ["BUYER", "SELLER", "ADMIN"] },
  { prefix: "/account", roles: ["BUYER", "SELLER", "ADMIN"] },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rule = PROTECTED.find(
    (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`),
  );
  if (!rule) return NextResponse.next();

  // Salt diturunkan otomatis dari nama cookie (`authjs.session-token`).
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!rule.roles.includes(token.role as string)) return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/seller/:path*", "/admin/:path*", "/checkout/:path*", "/orders/:path*", "/account/:path*"],
};
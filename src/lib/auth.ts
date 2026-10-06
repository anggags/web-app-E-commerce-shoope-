import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@/generated/prisma/enums";

/** Cache singkat agar session callback tidak query DB di setiap request. */
const identityCache = new Map<string, { role: Role; isBanned: boolean; at: number }>();
const IDENTITY_TTL_MS = 60_000;

async function getFreshIdentity(userId: string) {
  const cached = identityCache.get(userId);
  if (cached && Date.now() - cached.at < IDENTITY_TTL_MS) return cached;

  const user = await prisma.user
    .findUnique({ where: { id: userId }, select: { role: true, isBanned: true } })
    .catch(() => null);

  if (!user) return cached ?? null;

  const identity = { role: user.role, isBanned: user.isBanned, at: Date.now() };
  identityCache.set(userId, identity);
  return identity;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/sign-in", error: "/sign-in" },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.passwordHash) return null;

        // Akun nonaktif tetap gagal dengan CredentialsSignin (tanpa pesan
        // bocor). `loginAction` mengecek status ban terpisah agar bisa
        // menampilkan pesan yang tepat.
        if (user.isBanned) return null;

        const passwordValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!passwordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        select: { isBanned: true },
      });

      return !existing?.isBanned;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "BUYER";
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = token.id ?? "";

      // Role dan status blokir bisa berubah oleh admin kapan saja. JWT bersifat
      // stateless, jadi setiap 60 detik kita segarkan role dari database.
      const fresh = token.id ? await getFreshIdentity(token.id) : null;
      session.user.role = (fresh?.role ?? (token.role as Role) ?? "BUYER") as Role;
      session.user.isBanned = fresh?.isBanned ?? false;

      return session;
    },
  },
});

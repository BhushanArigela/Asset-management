import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") || process.env.AUTH_URL?.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostPrefix = useSecureCookies ? "__Host-" : "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  cookies: {
    csrfToken: { name: `${hostPrefix}authjs.csrf-token`, options: { path: '/', sameSite: 'lax', secure: useSecureCookies } },
    sessionToken: { name: `${cookiePrefix}authjs.session-token`, options: { path: '/', sameSite: 'lax', secure: useSecureCookies, httpOnly: true } },
    callbackUrl: { name: `${cookiePrefix}authjs.callback-url`, options: { path: '/', sameSite: 'lax', secure: useSecureCookies } },
  },
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        if (!user || !user.passwordHash || !user.isActive) return null;

        const passwordsMatch = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          permissions: user.role.rolePermissions.map(
            (rp) => `${rp.permission.module}.${rp.permission.action}`
          ),
        } as any;
      },
    }),
  ],
});

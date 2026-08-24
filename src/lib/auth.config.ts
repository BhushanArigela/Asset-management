import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/login`,
    error: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/login`,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.endsWith("/login");
      const isForgotPassword = nextUrl.pathname.endsWith("/forgot-password");
      const isResetPassword = nextUrl.pathname.endsWith("/reset-password");
      const isPublicRoute = nextUrl.pathname.endsWith("/api/qr/scan") || nextUrl.pathname.includes("/api/auth");

      if (isPublicRoute || isForgotPassword || isResetPassword) return true;

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).permissions = token.permissions as string[];
      }
      return session;
    },
  },
  providers: [],
};

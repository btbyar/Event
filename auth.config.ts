import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/admin/login" },
  providers: [],
  // Required behind any reverse proxy where the public domain isn't known at
  // build time (Railway's auto-assigned *.up.railway.app, a Cloudflare
  // tunnel, etc.) — without this, Auth.js rejects requests whose Host header
  // doesn't match a hardcoded AUTH_URL. Safe here because the app sits behind
  // a single trusted platform-managed proxy, not directly on the open internet.
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isLoginPage = pathname === "/admin/login";
      const isAdminRoute = pathname.startsWith("/admin");

      if (!isAdminRoute) return true;
      if (isLoginPage) return isLoggedIn ? Response.redirect(new URL("/admin/dashboard", request.nextUrl)) : true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;

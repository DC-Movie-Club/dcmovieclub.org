import { type NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge/lib/next/middleware";
import { authConfig } from "@/lib/auth-config";
import { ADMIN_DEFAULT_TAB } from "@/app/admin/config";

const ADMIN_LOGIN = "/admin";

export async function proxy(request: NextRequest) {
  return authMiddleware(request, {
    ...authConfig,
    loginPath: "/api/admin/login",
    logoutPath: "/api/admin/logout",
    enableMultipleCookies: true,
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    handleValidToken: async ({ decodedToken }, headers) => {
      const path = request.nextUrl.pathname;

      if (path === ADMIN_LOGIN && decodedToken.admin) {
        return NextResponse.redirect(new URL(ADMIN_DEFAULT_TAB, request.url));
      }

      if (
        path.startsWith("/admin") &&
        path !== ADMIN_LOGIN &&
        !decodedToken.admin
      ) {
        return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
      }

      return NextResponse.next({ request: { headers } });
    },
    handleInvalidToken: async () => {
      const path = request.nextUrl.pathname;

      if (path.startsWith("/admin") && path !== ADMIN_LOGIN) {
        return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
      }

      return NextResponse.next();
    },
    handleError: async () => {
      const path = request.nextUrl.pathname;

      if (path.startsWith("/admin") && path !== ADMIN_LOGIN) {
        return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
      }

      return NextResponse.next();
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

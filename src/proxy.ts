import { type NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "next-firebase-auth-edge/lib/next/middleware";

const ADMIN_LOGIN = "/admin";

export async function proxy(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: "/api/admin/login",
    logoutPath: "/api/admin/logout",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    cookieName: "AdminSession",
    cookieSignatureKeys: [process.env.COOKIE_SECRET!],
    enableMultipleCookies: true,
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    serviceAccount: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
        /\\n/g,
        "\n"
      ),
    },
    handleValidToken: async ({ decodedToken }, headers) => {
      const path = request.nextUrl.pathname;

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

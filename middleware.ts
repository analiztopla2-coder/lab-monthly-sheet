// middleware.ts - Route koruma ve JWT doğrulama
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "./lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login ve seed sayfaları herkese açık
  if (pathname === "/login" || pathname === "/api/seed") {
    return NextResponse.next();
  }

  // Korunan rotalar: /, /sheet/**, /admin/**
  if (pathname === "/" || pathname.startsWith("/sheet") || pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session");
    console.log("🔒 Middleware check:", { pathname, hasCookie: !!sessionCookie });

    if (!sessionCookie) {
      console.log("❌ No session cookie, redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // JWT doğrula
    const payload = await verifyTokenEdge(sessionCookie.value);
    console.log("🔍 Token verify result:", payload);
    if (!payload) {
      console.log("❌ Invalid token, redirecting to /login");
      // Geçersiz token - cookie'yi sil ve login'e yönlendir
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }

    // Admin sayfaları için rol kontrolü
    if (pathname.startsWith("/admin")) {
      if (payload.role !== "admin") {
        console.log("❌ Non-admin user trying to access admin page");
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    console.log("✅ Valid session:", payload.username);
    // Token geçerli, devam et
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sheet/:path*", "/admin/:path*", "/login", "/api/seed"],
};

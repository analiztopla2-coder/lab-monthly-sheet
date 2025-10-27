// app/api/auth/logout/route.ts - Logout endpoint
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import { logActivity } from "@/lib/activity-logger";

export async function POST(request: NextRequest) {
  try {
    // Mevcut kullanıcıyı al
    const token = request.cookies.get("session")?.value;
    if (token) {
      try {
        const payload = await verifyTokenEdge(token);
        if (payload) {
          // Logout logla
          await logActivity({
            userId: payload.userId,
            username: payload.username,
            action: "logout",
            ipAddress: request.ip || "unknown",
            userAgent: request.headers.get("user-agent") || undefined,
          });
        }
      } catch {
        // Token geçersiz, loglamadan devam et
      }
    }
  } catch (error) {
    console.error("Logout log error:", error);
    // Hata olsa bile logout devam etsin
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  
  // Cookie'yi sil
  response.cookies.delete("session");
  
  return response;
}

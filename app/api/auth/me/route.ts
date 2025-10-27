// app/api/auth/me/route.ts - Mevcut kullanıcı bilgisi
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Oturum bulunamadı" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(sessionCookie.value);

    if (!payload) {
      return NextResponse.json(
        { error: "Geçersiz oturum" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        username: payload.username,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

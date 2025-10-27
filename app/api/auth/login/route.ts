// app/api/auth/login/route.ts - Login endpoint
import { NextRequest, NextResponse } from "next/server";
import { findUserByUsername, comparePassword, createToken } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

// Basit rate-limiting (in-memory)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }

  if (attempt.count >= 10) {
    return false;
  }

  attempt.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Kullanıcı adı ve şifre gerekli" },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await findUserByUsername(username);
    console.log("Login attempt:", { username, userFound: !!user });
    if (!user) {
      // Başarısız giriş logla
      await logActivity({
        username,
        action: "login_failed",
        details: "Kullanıcı bulunamadı",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
      });
      
      return NextResponse.json(
        { error: "Kullanıcı adı veya şifre hatalı" },
        { status: 401 }
      );
    }

    // Şifre doğrula
    const isValid = await comparePassword(password, user.pass_hash);
    if (!isValid) {
      // Başarısız giriş logla
      await logActivity({
        userId: user.id,
        username: user.username,
        action: "login_failed",
        details: "Yanlış şifre",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
      });
      
      return NextResponse.json(
        { error: "Kullanıcı adı veya şifre hatalı" },
        { status: 401 }
      );
    }

    // JWT oluştur
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Başarılı giriş logla
    await logActivity({
      userId: user.id,
      username: user.username,
      action: "login",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // HttpOnly cookie set et
    const response = NextResponse.json(
      { success: true, user: { id: user.id, username: user.username, role: user.role } },
      { status: 200 }
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// app/api/admin/users/route.ts - Kullanıcı listeleme ve ekleme
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, hashPassword } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-logger";
import { cookies } from "next/headers";

// Kullanıcıları listele (sadece admin)
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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    const { data: users, error } = await supabaseServer
      .from("app_users")
      .select("id, username, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Users fetch error:", error);
      return NextResponse.json(
        { error: "Kullanıcılar yüklenemedi" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// Yeni kullanıcı ekle (sadece admin)
export async function POST(request: NextRequest) {
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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Kullanıcı adı ve şifre gerekli" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalı" },
        { status: 400 }
      );
    }

    if (role && !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Geçersiz rol" },
        { status: 400 }
      );
    }

    // Kullanıcı adı kontrolü
    const { data: existingUser } = await supabaseServer
      .from("app_users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const passHash = await hashPassword(password);

    // Kullanıcıyı ekle
    const { data: newUser, error: insertError } = await supabaseServer
      .from("app_users")
      .insert([
        {
          username,
          pass_hash: passHash,
          role: role || "user",
        },
      ])
      .select("id, username, role, created_at")
      .single();

    if (insertError) {
      console.error("User insert error:", insertError);
      return NextResponse.json(
        { error: "Kullanıcı eklenemedi" },
        { status: 500 }
      );
    }

    // Kullanıcı oluşturma logla
    await logActivity({
      userId: payload.userId,
      username: payload.username,
      action: "user_created",
      details: `Yeni kullanıcı: ${username} (${role || "user"})`,
      ipAddress: request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

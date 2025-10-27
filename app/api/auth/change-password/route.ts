// app/api/auth/change-password/route.ts - Şifre değiştirme endpoint
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, comparePassword, updateUserPassword } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    // JWT'den kullanıcıyı al
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Eski ve yeni şifre gerekli" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Yeni şifre en az 6 karakter olmalı" },
        { status: 400 }
      );
    }

    // Kullanıcıyı getir
    const { data: user, error: userError } = await supabaseServer
      .from("app_users")
      .select("*")
      .eq("id", payload.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Eski şifreyi doğrula
    const isValid = await comparePassword(oldPassword, user.pass_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Eski şifre hatalı" }, { status: 401 });
    }

    // Yeni şifreyi güncelle
    await updateUserPassword(payload.userId, newPassword);

    // Oturumu sonlandır (yeniden giriş yapması için)
    const response = NextResponse.json(
      { success: true, message: "Şifre değiştirildi. Lütfen tekrar giriş yapın." },
      { status: 200 }
    );
    response.cookies.delete("session");

    return response;
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

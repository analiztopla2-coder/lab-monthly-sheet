// app/api/admin/users/[id]/route.ts - Kullanıcı silme ve güncelleme
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, hashPassword } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-logger";
import { cookies } from "next/headers";

// Kullanıcı güncelleme (şifre ve/veya rol)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { password, role } = body;

    // En az bir alan güncellenmelidir
    if (!password && !role) {
      return NextResponse.json(
        { error: "Şifre veya rol belirtilmelidir" },
        { status: 400 }
      );
    }

    // Şifre validasyonu
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalı" },
        { status: 400 }
      );
    }

    // Rol validasyonu
    if (role && !["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Geçersiz rol" },
        { status: 400 }
      );
    }

    // Mevcut kullanıcı bilgilerini al
    const { data: existingUser } = await supabaseServer
      .from("app_users")
      .select("username, role")
      .eq("id", id)
      .single();

    if (!existingUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Güncelleme objesi oluştur
    const updateData: any = {};
    const changes: string[] = [];

    if (password) {
      updateData.pass_hash = await hashPassword(password);
      changes.push("Şifre değiştirildi");
    }

    if (role && role !== existingUser.role) {
      updateData.role = role;
      changes.push(`Rol: ${existingUser.role} → ${role}`);
    }

    // Güncelleme yap
    const { error } = await supabaseServer
      .from("app_users")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("User update error:", error);
      return NextResponse.json(
        { error: "Kullanıcı güncellenemedi" },
        { status: 500 }
      );
    }

    // Güncelleme logla
    if (changes.length > 0) {
      await logActivity({
        userId: payload.userId,
        username: payload.username,
        action: "user_updated",
        details: `${existingUser.username} güncellendi: ${changes.join(", ")}`,
        ipAddress: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "Kullanıcı başarıyla güncellendi"
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Kendi hesabını silmeye çalışıyor mu?
    if (payload.userId === id) {
      return NextResponse.json(
        { error: "Kendi hesabınızı silemezsiniz" },
        { status: 400 }
      );
    }

    // Silinecek kullanıcının bilgilerini al
    const { data: userToDelete } = await supabaseServer
      .from("app_users")
      .select("username, role")
      .eq("id", id)
      .single();

    const { error } = await supabaseServer
      .from("app_users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("User delete error:", error);
      return NextResponse.json(
        { error: "Kullanıcı silinemedi" },
        { status: 500 }
      );
    }

    // Kullanıcı silme logla
    if (userToDelete) {
      await logActivity({
        userId: payload.userId,
        username: payload.username,
        action: "user_deleted",
        details: `Silinen kullanıcı: ${userToDelete.username} (${userToDelete.role})`,
        ipAddress: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// app/api/admin/logs/route.ts - Aktivite loglarını getir (sadece admin)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      );
    }

    // Query parametreleri
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const action = searchParams.get("action"); // Belirli bir action filtreleme

    let query = supabaseServer
      .from("user_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Action filtresi varsa ekle
    if (action) {
      query = query.eq("action", action);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error("Logs fetch error:", error);
      return NextResponse.json(
        { error: "Loglar yüklenemedi" },
        { status: 500 }
      );
    }

    // Toplam log sayısı
    let countQuery = supabaseServer
      .from("user_activity_logs")
      .select("*", { count: "exact", head: true });

    if (action) {
      countQuery = countQuery.eq("action", action);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      logs,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("GET /api/admin/logs error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

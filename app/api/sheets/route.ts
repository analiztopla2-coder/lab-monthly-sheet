// app/api/sheets/route.ts - Tüm sheet'leri listele
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/sheets
 * Tüm sheet'lerin listesini döner (year, month, updated_at)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const payload = verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
    }

    const { data: sheets, error } = await supabaseServer
      .from("monthly_sheets")
      .select("id, year, month, updated_at")
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sheets }, { status: 200 });
  } catch (error) {
    console.error("List sheets error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

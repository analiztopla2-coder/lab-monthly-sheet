// app/api/sheet/route.ts - Sheet CRUD (GET, POST)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";
import { emptyMonth, getDaysInMonth } from "@/lib/rows";

/**
 * GET /api/sheet?year=2025&month=9
 * Belirtilen yıl/ay için sheet'i getirir, yoksa oluşturur
 */
export async function GET(request: NextRequest) {
  try {
    // JWT doğrula
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || "");
    const month = parseInt(searchParams.get("month") || "");

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return NextResponse.json({ error: "Geçersiz yıl/ay" }, { status: 400 });
    }

    // Sheet'i bul
    const { data: sheet, error } = await supabaseServer
      .from("monthly_sheets")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // Yoksa oluştur
    if (!sheet) {
      const days = getDaysInMonth(year, month);
      const rows = emptyMonth(days);

      const { data: newSheet, error: insertError } = await supabaseServer
        .from("monthly_sheets")
        .insert({
          year,
          month,
          rows,
          created_by: payload.userId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({ sheet: newSheet }, { status: 200 });
    }

    return NextResponse.json({ sheet }, { status: 200 });
  } catch (error) {
    console.error("Get sheet error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * POST /api/sheet
 * Yeni bir ay sheet'i oluşturur
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const payload = await verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
    }

    const body = await request.json();
    const { year, month } = body;

    if (!year || month === undefined || month < 0 || month > 11) {
      return NextResponse.json({ error: "Geçersiz yıl/ay" }, { status: 400 });
    }

    // Zaten var mı kontrol et
    const { data: existing } = await supabaseServer
      .from("monthly_sheets")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Bu ay zaten mevcut" },
        { status: 409 }
      );
    }

    // Yeni sheet oluştur
    const days = getDaysInMonth(year, month);
    const rows = emptyMonth(days);

    const { data: newSheet, error: insertError } = await supabaseServer
      .from("monthly_sheets")
      .insert({
        year,
        month,
        rows,
        created_by: payload.userId,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ sheet: newSheet }, { status: 201 });
  } catch (error) {
    console.error("Create sheet error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

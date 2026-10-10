// app/api/sheet/route.ts - Sheet CRUD (GET, POST)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getDaysInMonth } from "@/lib/rows";
import {
  buildEmptyRows,
  resolveParametersForSheet,
} from "@/lib/parameters";
import {
  countNonEmptyCells,
  mergeRowsForParameters,
} from "@/lib/sheet-normalize";

/**
 * GET /api/sheet?year=2025&month=9
 * Belirtilen yıl/ay için sheet'i getirir, yoksa oluşturur
 */
export async function GET(request: NextRequest) {
  try {
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

    const days = getDaysInMonth(year, month);

    const { data: sheet, error } = await getSupabaseAdmin()
      .from("monthly_sheets")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!sheet) {
      const parameters = await resolveParametersForSheet(year, month, {});
      if (parameters.length === 0) {
        return NextResponse.json(
          {
            error:
              "Parametre listesi yüklenemedi. Veri güvenliği nedeniyle işlem durduruldu.",
          },
          { status: 503 }
        );
      }
      const rows = buildEmptyRows(
        parameters.map((p) => p.id),
        days
      );

      const { data: newSheet, error: insertError } = await getSupabaseAdmin()
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

      const { logActivity } = await import("@/lib/activity-logger");
      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await logActivity({
        userId: payload.userId,
        username: payload.username,
        action: "sheet_created",
        details: `${year}/${month + 1} ayı oluşturuldu`,
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { sheet: newSheet, parameters },
        { status: 200 }
      );
    }

    const parameters = await resolveParametersForSheet(
      year,
      month,
      sheet.rows || {}
    );

    const storedNonEmpty = countNonEmptyCells(sheet.rows);
    if (parameters.length === 0 && storedNonEmpty > 0) {
      return NextResponse.json(
        {
          error:
            "Parametre listesi çözümlenemedi. Mevcut kayıtlı veriler korunuyor.",
        },
        { status: 503 }
      );
    }

    const mergedRows = mergeRowsForParameters(
      sheet.rows || {},
      parameters,
      days
    );
    const sheetWithMerged = { ...sheet, rows: mergedRows };

    const { logActivity } = await import("@/lib/activity-logger");
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await logActivity({
      userId: payload.userId,
      username: payload.username,
      action: "sheet_viewed",
      details: `${year}/${month + 1} ayı görüntülendi`,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { sheet: sheetWithMerged, parameters },
      { status: 200 }
    );
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

    const { data: existing } = await getSupabaseAdmin()
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

    const days = getDaysInMonth(year, month);
    const parameters = await resolveParametersForSheet(year, month, {});
    if (parameters.length === 0) {
      return NextResponse.json(
        {
          error:
            "Parametre listesi yüklenemedi. Veri güvenliği nedeniyle işlem durduruldu.",
        },
        { status: 503 }
      );
    }
    const rows = buildEmptyRows(
      parameters.map((p) => p.id),
      days
    );

    const { data: newSheet, error: insertError } = await getSupabaseAdmin()
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

    const { logActivity } = await import("@/lib/activity-logger");
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await logActivity({
      userId: payload.userId,
      username: payload.username,
      action: "sheet_created",
      details: `${year}/${month + 1} ayı manuel olarak oluşturuldu`,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { sheet: newSheet, parameters },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create sheet error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

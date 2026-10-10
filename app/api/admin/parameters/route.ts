import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromSession } from "@/lib/require-admin";
import {
  findActiveNameConflict,
  getNextSortOrder,
  monthStartDate,
  normalizeParameterName,
  toApiParameter,
} from "@/lib/parameters";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-logger";

/**
 * POST /api/admin/parameters
 * Body: { name: string, year: number, month: number } (month 0–11)
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session");
    const auth = await requireAdminFromSession(sessionCookie?.value);
    if (auth instanceof NextResponse) return auth;
    const { payload } = auth;

    const body = await request.json();
    const rawName = typeof body.name === "string" ? body.name : "";
    const name = rawName.trim();
    const year = parseInt(String(body.year), 10);
    const month = parseInt(String(body.month), 10);

    if (!name) {
      return NextResponse.json(
        { error: "Parametre adı gerekli" },
        { status: 400 }
      );
    }

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return NextResponse.json({ error: "Geçersiz yıl/ay" }, { status: 400 });
    }

    const normalized = normalizeParameterName(name);
    const effectiveFrom = monthStartDate(year, month);

    const conflict = await findActiveNameConflict(normalized, effectiveFrom);
    if (conflict) {
      return NextResponse.json(
        { error: "Bu isimde aktif bir parametre zaten var" },
        { status: 409 }
      );
    }

    const sortOrder = await getNextSortOrder();

    const { data, error } = await getSupabaseAdmin()
      .from("lab_parameters")
      .insert({
        name,
        name_normalized: normalized,
        sort_order: sortOrder,
        effective_from: effectiveFrom,
        created_by: payload.userId,
      })
      .select("id, name, sort_order")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Bu isimde aktif bir parametre zaten var" },
          { status: 409 }
        );
      }
      throw error;
    }

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await logActivity({
      userId: payload.userId,
      username: payload.username,
      action: "user_updated",
      details: `Yeni parametre eklendi: ${name}`,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      { parameter: toApiParameter(data) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/parameters error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromSession } from "@/lib/require-admin";
import { monthStartDate } from "@/lib/parameters";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { logActivity } from "@/lib/activity-logger";

/**
 * DELETE /api/admin/parameters/:id?year=2025&month=9
 * Soft-deactivate from the given month onward (does not delete sheet data).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionCookie = request.cookies.get("session");
    const auth = await requireAdminFromSession(sessionCookie?.value);
    if (auth instanceof NextResponse) return auth;
    const { payload } = auth;

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || "", 10);
    const month = parseInt(searchParams.get("month") || "", 10);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return NextResponse.json({ error: "Geçersiz yıl/ay" }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await getSupabaseAdmin()
      .from("lab_parameters")
      .select("id, name, effective_to, deleted_at")
      .eq("id", params.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) {
      return NextResponse.json({ error: "Parametre bulunamadı" }, { status: 404 });
    }

    if (existing.deleted_at) {
      return NextResponse.json({ success: true });
    }

    const effectiveTo = monthStartDate(year, month);
    const now = new Date().toISOString();

    const { error: updateError } = await getSupabaseAdmin()
      .from("lab_parameters")
      .update({
        effective_to: effectiveTo,
        deleted_at: now,
        deleted_by: payload.userId,
        updated_at: now,
      })
      .eq("id", params.id);

    if (updateError) throw updateError;

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await logActivity({
      userId: payload.userId,
      username: payload.username,
      action: "user_updated",
      details: `Parametre kaldırıldı (soft): ${existing.name}`,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/parameters error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

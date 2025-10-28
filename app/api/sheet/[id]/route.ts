// app/api/sheet/[id]/route.ts - Sheet güncelleme (PUT)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * PUT /api/sheet/:id
 * Sheet'in rows verisini günceller ve değişiklikleri loglar
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { rows } = body;

    if (!rows) {
      return NextResponse.json({ error: "rows verisi gerekli" }, { status: 400 });
    }

    // Eski sheet'i al (karşılaştırma için)
    const { data: oldSheet, error: fetchError } = await supabaseServer
      .from("monthly_sheets")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError) throw fetchError;

    // Değişiklikleri tespit et
    const changes = detectChanges(oldSheet.rows, rows);

    // Sheet'i güncelle
    const { data: updated, error } = await supabaseServer
      .from("monthly_sheets")
      .update({
        rows,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    // Activity log (detaylı)
    if (changes.length > 0) {
      const { logActivity } = await import("@/lib/activity-logger");
      
      // IP ve User-Agent al
      const ipAddress = request.headers.get("x-forwarded-for") || 
                       request.headers.get("x-real-ip") || 
                       "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";
      
      for (const change of changes) {
        await logActivity({
          userId: payload.userId as string,
          username: payload.username as string,
          action: "sheet_updated",
          details: `${oldSheet.year}/${oldSheet.month + 1} - ${change.parameter} (Gün ${change.day}): "${change.oldValue}" → "${change.newValue}"`,
          ipAddress,
          userAgent,
        });
      }
    }

    return NextResponse.json({ sheet: updated }, { status: 200 });
  } catch (error) {
    console.error("Update sheet error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * İki rows objesi arasındaki değişiklikleri tespit eder
 */
function detectChanges(oldRows: any, newRows: any) {
  const changes: Array<{
    parameter: string;
    day: number;
    oldValue: string;
    newValue: string;
  }> = [];

  // Her parametre için kontrol
  for (const parameter in newRows) {
    const oldValues = oldRows[parameter] || [];
    const newValues = newRows[parameter] || [];

    // Her gün için karşılaştır
    for (let dayIndex = 0; dayIndex < newValues.length; dayIndex++) {
      const oldValue = oldValues[dayIndex] || "";
      const newValue = newValues[dayIndex] || "";

      // Değişiklik varsa kaydet
      if (oldValue !== newValue) {
        changes.push({
          parameter,
          day: dayIndex + 1, // Gün numarası 1'den başlar
          oldValue: oldValue || "(boş)",
          newValue: newValue || "(boş)",
        });
      }
    }
  }

  return changes;
}

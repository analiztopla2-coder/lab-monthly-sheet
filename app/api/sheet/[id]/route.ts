// app/api/sheet/[id]/route.ts - Sheet güncelleme (PUT)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { RowsJson } from "@/lib/rows";
import { fetchParametersByIds, resolveParametersForSheet } from "@/lib/parameters";
import {
  applyParameterUpdatesToStored,
  countNonEmptyCells,
  countNonEmptyInParameterPayload,
} from "@/lib/sheet-normalize";

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
    const { rows } = body as { rows?: RowsJson };

    if (!rows) {
      return NextResponse.json({ error: "rows verisi gerekli" }, { status: 400 });
    }

    const { data: oldSheet, error: fetchError } = await getSupabaseAdmin()
      .from("monthly_sheets")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError) throw fetchError;

    const parameters = await resolveParametersForSheet(
      oldSheet.year,
      oldSheet.month,
      oldSheet.rows || {}
    );

    const existingNonEmpty = countNonEmptyCells(oldSheet.rows);
    const incomingNonEmpty = countNonEmptyInParameterPayload(rows, parameters);

    if (parameters.length === 0 && existingNonEmpty > 0) {
      return NextResponse.json(
        {
          error:
            "Parametre listesi yüklenemedi. Mevcut veriler korunuyor; kayıt reddedildi.",
        },
        { status: 409 }
      );
    }

    if (existingNonEmpty > 0 && incomingNonEmpty === 0) {
      return NextResponse.json(
        {
          error:
            "Boş veri gönderildi. Mevcut dolu kayıtların üzerine yazılmadı.",
        },
        { status: 409 }
      );
    }

    const mergedRows = applyParameterUpdatesToStored(
      oldSheet.rows || {},
      rows,
      parameters
    );

    const changes = await detectChanges(oldSheet.rows || {}, mergedRows);

    const { data: updated, error } = await getSupabaseAdmin()
      .from("monthly_sheets")
      .update({
        rows: mergedRows,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    if (changes.length > 0) {
      const { logActivity } = await import("@/lib/activity-logger");

      const ipAddress =
        request.headers.get("x-forwarded-for") ||
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

async function resolveParameterLabel(
  parameterKey: string,
  nameById: Map<string, string>
): Promise<string> {
  if (nameById.has(parameterKey)) {
    return nameById.get(parameterKey)!;
  }
  return parameterKey;
}

async function detectChanges(oldRows: RowsJson, newRows: RowsJson) {
  const changes: Array<{
    parameter: string;
    day: number;
    oldValue: string;
    newValue: string;
  }> = [];

  const ids = new Set<string>();
  for (const key of Object.keys(oldRows)) ids.add(key);
  for (const key of Object.keys(newRows)) ids.add(key);

  const uuidIds = [...ids].filter((k) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)
  );
  const nameById = new Map<string, string>();
  if (uuidIds.length > 0) {
    const params = await fetchParametersByIds(uuidIds);
    for (const p of params) {
      nameById.set(p.id, p.name);
    }
  }

  for (const parameter of Object.keys(newRows)) {
    const oldValues = oldRows[parameter] || [];
    const newValues = newRows[parameter] || [];
    const label = await resolveParameterLabel(parameter, nameById);

    for (let dayIndex = 0; dayIndex < newValues.length; dayIndex++) {
      const oldValue = oldValues[dayIndex] || "";
      const newValue = newValues[dayIndex] || "";

      if (oldValue !== newValue) {
        changes.push({
          parameter: label,
          day: dayIndex + 1,
          oldValue: oldValue || "(boş)",
          newValue: newValue || "(boş)",
        });
      }
    }
  }

  return changes;
}

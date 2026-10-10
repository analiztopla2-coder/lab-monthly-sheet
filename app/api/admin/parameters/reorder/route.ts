import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromSession } from "@/lib/require-admin";
import {
  assertRegistryParameterIds,
  isRegistryParameterId,
  sameIdSet,
} from "@/lib/parameter-ids";
import {
  ReorderStaleOrderError,
  ReorderValidationError,
  reorderLabParameters,
} from "@/lib/reorder-parameters";
import { resolveParametersForSheet } from "@/lib/parameters";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import type { RowsJson } from "@/lib/rows";

/**
 * PATCH /api/admin/parameters/reorder
 * Body: { year, month (0–11), expectedOrderIds, orderedIds }
 */
export async function PATCH(request: NextRequest) {
  let year = NaN;
  let month = NaN;
  let sheetRows: RowsJson = {};

  try {
    const sessionCookie = request.cookies.get("session");
    const auth = await requireAdminFromSession(sessionCookie?.value);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    year = parseInt(String(body.year), 10);
    month = parseInt(String(body.month), 10);
    const expectedOrderIds = body.expectedOrderIds as string[] | undefined;
    const orderedIds = body.orderedIds as string[] | undefined;

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return NextResponse.json({ error: "Geçersiz yıl/ay" }, { status: 400 });
    }

    if (!Array.isArray(expectedOrderIds) || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    const idError =
      assertRegistryParameterIds(expectedOrderIds) ||
      assertRegistryParameterIds(orderedIds);
    if (idError) {
      return NextResponse.json({ error: idError }, { status: 400 });
    }

    if (!sameIdSet(expectedOrderIds, orderedIds)) {
      return NextResponse.json(
        { error: "Parametre kimlik setleri uyuşmuyor" },
        { status: 400 }
      );
    }

    const { data: sheet } = await getSupabaseAdmin()
      .from("monthly_sheets")
      .select("rows")
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    sheetRows = sheet?.rows || {};

    const serverVisible = await resolveParametersForSheet(
      year,
      month,
      sheetRows
    );
    const serverIds = serverVisible
      .map((p) => p.id)
      .filter((id) => isRegistryParameterId(id));

    const serverIdSet = [...serverIds].sort();
    const payloadSet = [...expectedOrderIds].sort();
    if (
      serverIdSet.length !== payloadSet.length ||
      !serverIdSet.every((id, i) => id === payloadSet[i])
    ) {
      return NextResponse.json(
        {
          error: "Görünür parametre seti güncel değil",
          parameters: serverVisible,
        },
        { status: 409 }
      );
    }

    const serverOrder = serverVisible
      .filter((p) => serverIds.includes(p.id))
      .map((p) => p.id);

    if (serverOrder.join(",") !== expectedOrderIds.join(",")) {
      return NextResponse.json(
        {
          error:
            "Satır sırası başka bir yönetici tarafından değiştirilmiş. Güncel sıra yeniden yüklendi.",
          parameters: serverVisible,
        },
        { status: 409 }
      );
    }

    await reorderLabParameters(expectedOrderIds, orderedIds);

    const parameters = await resolveParametersForSheet(year, month, sheetRows);

    return NextResponse.json({
      success: true,
      message: "Satır sırası kaydedildi.",
      parameters,
    });
  } catch (error) {
    if (error instanceof ReorderStaleOrderError) {
      let parameters: Awaited<ReturnType<typeof resolveParametersForSheet>> = [];
      if (!isNaN(year) && !isNaN(month)) {
        try {
          parameters = await resolveParametersForSheet(year, month, sheetRows);
        } catch {
          /* optional refresh */
        }
      }
      return NextResponse.json(
        {
          error:
            "Satır sırası başka bir yönetici tarafından değiştirilmiş. Güncel sıra yeniden yüklendi.",
          parameters,
        },
        { status: 409 }
      );
    }
    if (error instanceof ReorderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("PATCH /api/admin/parameters/reorder error:", error);
    return NextResponse.json(
      { error: "Satır sırası kaydedilemedi." },
      { status: 500 }
    );
  }
}

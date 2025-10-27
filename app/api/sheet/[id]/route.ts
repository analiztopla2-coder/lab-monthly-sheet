// app/api/sheet/[id]/route.ts - Sheet güncelleme (PUT)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * PUT /api/sheet/:id
 * Sheet'in rows verisini günceller
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

    const payload = verifyToken(sessionCookie.value);
    if (!payload) {
      return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
    }

    const body = await request.json();
    const { rows } = body;

    if (!rows) {
      return NextResponse.json({ error: "rows verisi gerekli" }, { status: 400 });
    }

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

    return NextResponse.json({ sheet: updated }, { status: 200 });
  } catch (error) {
    console.error("Update sheet error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

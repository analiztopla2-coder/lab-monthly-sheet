import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  fetchParametersEffectiveForMonth,
  toApiParameter,
} from "@/lib/parameters";

/**
 * GET /api/parameters?year=2025&month=9
 * Returns parameters effective for the given calendar month.
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
    const year = parseInt(searchParams.get("year") || "", 10);
    const month = parseInt(searchParams.get("month") || "", 10);

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return NextResponse.json({ error: "Geçersiz yıl/ay" }, { status: 400 });
    }

    const rows = await fetchParametersEffectiveForMonth(year, month);
    return NextResponse.json({
      parameters: rows.map((p) => toApiParameter(p)),
    });
  } catch (error) {
    console.error("GET /api/parameters error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

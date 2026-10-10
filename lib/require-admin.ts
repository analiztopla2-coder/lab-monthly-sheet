import { NextResponse } from "next/server";
import { verifyToken, type JWTPayload } from "./auth";

export async function requireAdminFromSession(
  sessionToken: string | undefined
): Promise<{ payload: JWTPayload } | NextResponse> {
  if (!sessionToken) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
  }

  const payload = await verifyToken(sessionToken);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  return { payload };
}

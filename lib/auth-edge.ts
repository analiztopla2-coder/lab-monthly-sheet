// lib/auth-edge.ts - Edge Runtime uyumlu JWT (middleware için)
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.APP_JWT_SECRET || "lab_monthly_sheet_super_secret_jwt_key_2025_change_me_in_production"
);

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * JWT token'ı doğrular (Edge Runtime uyumlu)
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("❌ JWT verify error (Edge):", error instanceof Error ? error.message : error);
    return null;
  }
}

// lib/auth.ts - JWT kimlik doğrulama yardımcı fonksiyonları
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { supabaseServer } from "./supabase-server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.APP_JWT_SECRET || "lab_monthly_sheet_super_secret_jwt_key_2025_change_me_in_production"
);

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * JWT token oluşturur
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
  return token;
}

/**
 * JWT token'ı doğrular
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("❌ JWT verify error:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Şifre hash'ler
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Şifre karşılaştırır
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Kullanıcı adına göre kullanıcı bulur
 */
export async function findUserByUsername(username: string) {
  const { data, error } = await supabaseServer
    .from("app_users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return null;
  return data;
}

/**
 * Yeni kullanıcı oluşturur
 */
export async function createUser(
  username: string,
  password: string,
  role = "user"
) {
  const passHash = await hashPassword(password);
  const { data, error } = await supabaseServer
    .from("app_users")
    .insert({ username, pass_hash: passHash, role })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Kullanıcı şifresini günceller
 */
export async function updateUserPassword(userId: string, newPassword: string) {
  const passHash = await hashPassword(newPassword);
  const { error } = await supabaseServer
    .from("app_users")
    .update({ pass_hash: passHash })
    .eq("id", userId);

  if (error) throw error;
}
